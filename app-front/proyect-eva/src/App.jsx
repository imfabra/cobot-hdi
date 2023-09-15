import Buttonlink from "./components/buttonlink";
import Pcoordenadas from "./components/puntosdecoordenadas";
import { Toaster } from "react-hot-toast";

import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="header">
        <ul className="navbar">
          <div className="left-nabvar">
            <div className="container-logoHDI">
              <a
                href="https://grupohdi.com/es/nosotros/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={require(`./images/logohdicol.png`)}
                  className="imagen-hdi"
                  alt="logo hdi"
                  rel="icon"
                />
              </a>
            </div>
            <div className="container-title-eva">
              <p className="title-eva">
                <span className="span-eva">ARIA</span> - <b>Robot HDI</b>
              </p>
            </div>
          </div>
          <div className="right-nabvar">
            <li>
              {" "}
              <Buttonlink textbutton="Link 1" />
            </li>
            <li>
              {" "}
              <Buttonlink textbutton="Link 2" />
            </li>
            <li>
              {" "}
              <Buttonlink textbutton="Link 3" />{" "}
            </li>
          </div>
        </ul>
      </header>
      <main className="main">
        <Pcoordenadas />
      </main>

      <footer className="footer">
        <div className="footer-left">
          Grupo HDI Colombia
          {/* <img src={require("...")} alt="banco" /> */}
        </div>
        <div className="footer-mid">
          <p>
            <span>
              <b>designed by:</b></span>Grupo HDI
          </p>
        </div>
        <div className="footer-rigth">
          <p>
            <span>
              <b>Contact:</b>
            </span>
            000-0000-000
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;
