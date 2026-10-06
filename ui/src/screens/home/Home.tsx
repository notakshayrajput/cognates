import MainLayout from "../../layout/main-layout/MainLayout";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2, Settings2 } from "lucide-react";
import "./Home.css";

export default function Home() {
  return (
    <MainLayout>
      <div className="home">
        <div className="home__intro">
          <span className="home__eyebrow">YOUR LOCALIZATION WORKSPACE</span>
          <h1>Words that work<br /><span>everywhere.</span></h1>
          <p>Keep your language files organized, edit translations in context, and make every experience feel local.</p>
          <Link className="home__primary-link" to="/localize">
            Open localization <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="home__workspace">
          <div className="home__section-heading">
            <span className="home__eyebrow">WORKSPACE</span>
            <h2>Where would you like to start?</h2>
          </div>
          <div className="home__cards">
            <Link to="/localize" className="home__card">
              <span className="home__card-icon"><Globe2 size={21} strokeWidth={1.8} /></span>
              <span className="home__card-copy">
                <strong>Localization</strong>
                <span>Edit strings, manage locales, and keep keys in sync.</span>
              </span>
              <ArrowUpRight className="home__card-arrow" size={20} />
            </Link>
            <Link to="/configure" className="home__card">
              <span className="home__card-icon"><Settings2 size={21} strokeWidth={1.8} /></span>
              <span className="home__card-copy">
                <strong>Configuration</strong>
                <span>Set source paths and language preferences.</span>
              </span>
              <ArrowUpRight className="home__card-arrow" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
