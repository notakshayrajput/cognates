import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { RapidGrid } from 'rapid-grid-react'
import type { ColumnOptions } from 'rapid-grid-react'
import 'rapid-grid-react/style.css'
import './DataGridWrapper.css'

type LocaleData = Record<string, unknown>
type KeyChange = { oldKey: string; newKey: string }

interface LeafRow extends Record<string, unknown> {
    key: string
    value: string | null
    defaultValue: string
    path: string[]
    missing: boolean
}

interface DataGridWrapperProps {
    height?: string | number
    width?: string | number
    data: LocaleData
    defaultCultureData: LocaleData
    culture: string
    defaultCulture: string
    onUpdate?: (
        culture: string,
        updatedData: LocaleData,
        defaultCulture: string,
        updatedDefaultData: LocaleData,
        keyChanges: KeyChange | null,
    ) => void
}

type Edit =
    | { type: 'key'; path: string[]; value: string }
    | { type: 'value'; path: string[]; value: string }
    | { type: 'add'; path: string[]; key: string; value: string | LocaleData }

function asObject(value: unknown): LocaleData {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as LocaleData
        : {}
}

function setValueAtPath(data: LocaleData, path: string[], value: unknown): LocaleData {
    const [key, ...rest] = path
    return {
        ...data,
        [key]: rest.length ? setValueAtPath(asObject(data[key]), rest, value) : value,
    }
}

function renameKeyAtPath(data: LocaleData, path: string[], newKey: string): LocaleData {
    const [key, ...rest] = path
    if (rest.length) {
        if (!(key in data)) return data
        return { ...data, [key]: renameKeyAtPath(asObject(data[key]), rest, newKey) }
    }
    if (!(key in data)) return data
    return Object.fromEntries(
        Object.entries(data).map(([entryKey, value]) => [entryKey === key ? newKey : entryKey, value]),
    )
}

interface LeafGridProps {
    rows: LeafRow[]
    parentData: LocaleData
    isDefaultCulture: boolean
    onEdit: (edit: Edit) => void
    label: string
    showHeader: boolean
}

function LeafGrid({ rows, parentData, isDefaultCulture, onEdit, label, showHeader }: LeafGridProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [availableWidth, setAvailableWidth] = useState(800)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const measure = () => setAvailableWidth(container.clientWidth)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    const columns = useMemo<ColumnOptions[]>(() => {
        const keyWidth = Math.max(110, Math.min(360, Math.round(availableWidth * 0.34)))
        return [
            { binding: 'key', header: 'Key', width: keyWidth, readOnly: !isDefaultCulture },
            { binding: 'value', header: 'Value', width: Math.max(140, availableWidth - keyWidth) },
        ]
    }, [availableWidth, isDefaultCulture])

    return (
        <div ref={containerRef} className="cognates-grid__leaf-table">
            <RapidGrid
                aria-label={label}
                className="cognates-grid__rapid"
                items={rows}
                columns={columns}
                rowHeaderWidth={0}
                rowHeight={38}
                columnHeaderHeight={showHeader ? 38 : 0}
                style={{ height: Math.min(800, (showHeader ? 38 : 0) + rows.length * 38 + 8) }}
                onFormatItem={(grid, args) => {
                    if (args.panel !== grid.cells || !args.dataItem) return
                    const row = args.dataItem as LeafRow
                    if (args.col === 0) {
                        args.cellElement.title = row.path.join('.')
                    } else {
                        args.cellElement.classList.toggle('cognates-grid__fallback', row.missing)
                        if (row.missing) args.cellElement.textContent = row.defaultValue
                        args.cellElement.title = row.missing
                            ? 'Using the default locale value'
                            : String(row.value ?? '')
                    }
                }}
                onCellEditEnding={(_, args) => {
                    if (args.col !== 0) return
                    const nextKey = String(args.value).trim()
                    const currentKey = String(args.oldValue)
                    if (!nextKey || nextKey.includes('.') ||
                        (nextKey !== currentKey && Object.prototype.hasOwnProperty.call(parentData, nextKey))) {
                        args.cellElement.title = 'Enter a unique key without dots.'
                        args.cellElement.querySelector('input')?.setAttribute('aria-invalid', 'true')
                        return false
                    }
                    args.value = nextKey
                }}
                onCellEditEnded={(_, args) => {
                    const row = args.dataItem as LeafRow
                    if (args.col === 0) {
                        if (args.value !== args.oldValue) {
                            const oldPath = row.path
                            onEdit({ type: 'key', path: oldPath, value: String(args.value) })
                            row.path = [...oldPath.slice(0, -1), String(args.value)]
                        }
                    } else if (args.value !== args.oldValue) {
                        onEdit({ type: 'value', path: row.path, value: String(args.value) })
                    }
                }}
            />
        </div>
    )
}

interface LevelProps {
    defaultData: LocaleData
    actualData: LocaleData
    path: string[]
    isDefaultCulture: boolean
    collapsedState: Record<string, boolean>
    onToggle: (path: string) => void
    onEdit: (edit: Edit) => void
}

function LocaleGridLevel({
    defaultData, actualData, path, isDefaultCulture, collapsedState, onToggle, onEdit,
}: LevelProps) {
    const [adding, setAdding] = useState<'key' | 'group' | null>(null)
    const [newName, setNewName] = useState('')
    const [newValue, setNewValue] = useState('')
    const [addError, setAddError] = useState('')
    const sections: ReactNode[] = []
    let leaves: LeafRow[] = []

    const closeAddForm = () => {
        setAdding(null)
        setNewName('')
        setNewValue('')
        setAddError('')
    }

    const addEntry = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!adding) return
        const key = newName.trim()
        if (!key || key.includes('.')) {
            setAddError('Enter a key name without dots.')
            return
        }
        if (Object.prototype.hasOwnProperty.call(defaultData, key)) {
            setAddError('A key or group with this name already exists here.')
            return
        }
        onEdit({ type: 'add', path, key, value: adding === 'group' ? {} : newValue })
        closeAddForm()
    }

    const flushLeaves = () => {
        if (!leaves.length) return
        const rows = leaves
        sections.push(
            <LeafGrid
                key={rows[0].path.join('.')}
                rows={rows}
                parentData={defaultData}
                isDefaultCulture={isDefaultCulture}
                onEdit={onEdit}
                label={`${path.join('.') || 'Locale'} keys and values`}
                showHeader={path.length === 0}
            />,
        )
        leaves = []
    }

    for (const [key, defaultValue] of Object.entries(defaultData)) {
        const itemPath = [...path, key]
        const actualValue = actualData[key]
        if (defaultValue !== null && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
            flushLeaves()
            const fullPath = itemPath.join('.')
            const collapsed = collapsedState[fullPath] ?? false
            sections.push(
                <section className="cognates-grid__group" key={fullPath}>
                    <button
                        className="cognates-grid__group-toggle"
                        type="button"
                        aria-expanded={!collapsed}
                        onClick={() => onToggle(fullPath)}
                    >
                        <span className="cognates-grid__chevron" aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
                        <span>{key}</span>
                    </button>
                    {!collapsed && (
                        <div className="cognates-grid__nested">
                            <LocaleGridLevel
                                defaultData={asObject(defaultValue)}
                                actualData={asObject(actualValue)}
                                path={itemPath}
                                isDefaultCulture={isDefaultCulture}
                                collapsedState={collapsedState}
                                onToggle={onToggle}
                                onEdit={onEdit}
                            />
                        </div>
                    )}
                </section>,
            )
        } else {
            leaves.push({
                key,
                value: actualValue == null ? null : String(actualValue),
                defaultValue: defaultValue == null ? '' : String(defaultValue),
                path: itemPath,
                missing: !isDefaultCulture && (actualValue == null ||
                    (typeof actualValue === 'string' && !actualValue.trim())),
            })
        }
    }
    flushLeaves()

    return (
        <div className="cognates-grid__level">
            {sections.length ? sections : <p className="cognates-grid__empty">No keys in this section.</p>}
            {isDefaultCulture && (
                <div className="cognates-grid__add">
                    {adding ? (
                        <form onSubmit={addEntry} aria-label={`Add ${adding} in ${path.join('.') || 'root'}`}>
                            <label>
                                {adding === 'group' ? 'Group name' : 'Key name'}
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={event => { setNewName(event.target.value); setAddError('') }}
                                />
                            </label>
                            {adding === 'key' && (
                                <label>
                                    Value
                                    <input value={newValue} onChange={event => setNewValue(event.target.value)} />
                                </label>
                            )}
                            {addError && <p role="alert" className="cognates-grid__add-error">{addError}</p>}
                            <div className="cognates-grid__add-actions">
                                <button type="submit">Add {adding}</button>
                                <button type="button" onClick={closeAddForm}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="cognates-grid__add-actions">
                            <button type="button" onClick={() => setAdding('key')}>+ Add key</button>
                            <button type="button" onClick={() => setAdding('group')}>+ Add group</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function DataGridWrapper({
    height = '100%', width = '100%', data, defaultCultureData,
    culture, defaultCulture, onUpdate,
}: DataGridWrapperProps) {
    const [currentData, setCurrentData] = useState<LocaleData>(data)
    const [defaultData, setDefaultData] = useState<LocaleData>(defaultCultureData)
    const currentDataRef = useRef<LocaleData>(data)
    const defaultDataRef = useRef<LocaleData>(defaultCultureData)
    const [collapsedState, setCollapsedState] = useState<Record<string, boolean>>({})
    const isDefaultCulture = culture === defaultCulture

    useEffect(() => {
        currentDataRef.current = data
        setCurrentData(data)
    }, [data])

    useEffect(() => {
        defaultDataRef.current = defaultCultureData
        setDefaultData(defaultCultureData)
    }, [defaultCultureData])

    const handleEdit = (edit: Edit) => {
        let nextData: LocaleData
        let nextDefaultData: LocaleData = defaultDataRef.current
        let keyChange: KeyChange | null = null

        if (edit.type === 'key') {
            if (!isDefaultCulture) return
            nextData = renameKeyAtPath(currentDataRef.current, edit.path, edit.value)
            nextDefaultData = renameKeyAtPath(defaultDataRef.current, edit.path, edit.value)
            keyChange = {
                oldKey: edit.path.join('.'),
                newKey: [...edit.path.slice(0, -1), edit.value].join('.'),
            }
        } else if (edit.type === 'add') {
            if (!isDefaultCulture) return
            const newPath = [...edit.path, edit.key]
            nextData = setValueAtPath(currentDataRef.current, newPath, edit.value)
            nextDefaultData = setValueAtPath(defaultDataRef.current, newPath, edit.value)
        } else {
            nextData = setValueAtPath(currentDataRef.current, edit.path, edit.value)
            if (isDefaultCulture) nextDefaultData = setValueAtPath(defaultDataRef.current, edit.path, edit.value)
        }

        currentDataRef.current = nextData
        defaultDataRef.current = nextDefaultData
        setCurrentData(nextData)
        setDefaultData(nextDefaultData)
        onUpdate?.(culture, nextData, defaultCulture, nextDefaultData, keyChange)
    }

    return (
        <div className="cognates-grid" style={{ height, width }}>
            {!isDefaultCulture && (
                <p className="cognates-grid__hint">Add keys and groups in the default locale.</p>
            )}
            <LocaleGridLevel
                defaultData={defaultData}
                actualData={currentData}
                path={[]}
                isDefaultCulture={isDefaultCulture}
                collapsedState={collapsedState}
                onToggle={(path) => setCollapsedState(previous => ({ ...previous, [path]: !previous[path] }))}
                onEdit={handleEdit}
            />
        </div>
    )
}
