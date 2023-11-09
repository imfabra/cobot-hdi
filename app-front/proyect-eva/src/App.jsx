import React, { useState, useEffect } from "react";
import { BsSunFill, BsFillMoonFill,} from "react-icons/bs";
import Pcoordenadas from "./components/puntosdecoordenadas";
import { Toaster } from "react-hot-toast";
import "./stylesheets/App.css";

function App() {
  // Recupera el estado del tema almacenado en localStorage, o usa 'light' como valor predeterminado.
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);

  // Función para cambiar el tema y almacenar el estado en localStorage.
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Establece el tema al cargar la página.
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className={`App ${theme === 'dark'? 'App-dark':'App-light'} `}>
      <header className="header">
        <ul className={`navbar ${theme === "light"
        ?"navbar-light"
        :"navbar-dark"}`}>
          <div className="left-nabvar">
            <div className="container-logoHDI">
              <a
                href="https://grupohdi.com/es/nosotros/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={
                    theme === "light"
                      ? require(`./images/logohdicol.png`)
                      : require(`./images/logo-hdi-blanco-espanol-05.png`)
                  }
                  className="imagen-hdi"
                  alt="logo hdi"
                  rel="icon"
                />
              </a>
            </div>
            <div className="container-title-eva"></div>
            <p className="title-eva">
              <span className="span-eva">ARIA</span>
              <b className={`${theme==='light'? 'titulohdirobot-light':'titulohdirobot-dark'}`}> - Robot HDI</b>
            </p>
          </div>
          <div className="right-nabvar">
            <div className={`contenedor-theme  ${theme}`}>
              <label
                className={`theme-toggle ${
                  theme === "light" ? "light-toggle" : "dark-toggle"
                }`}
              >
                <input type="checkbox" onClick={toggleTheme} />
                <span className="sliderr">
                  {theme === "light" ? <BsSunFill /> : <BsFillMoonFill />}
                </span>
              </label>
            </div>
          </div>
        </ul>
      </header>
      <main className="main">
        <Pcoordenadas theme={theme} />
      </main>

      <footer className="footer">
        <div className="footer-left">
          <a
            href="https://grupohdi.com/nosotros/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {
              <img
                src={require("./images/logo-hdi-blanco-espanol-05.png")}
                alt="banco"
              />
            }
          </a>
        </div>
        <div className="footer-mid">
          <p>
            <span>
              <b>designed by: </b>
            </span>
            Grupo HDI
          </p>
        </div>
        <div className="footer-rigth">
          <p>
            <span>
              <b>Contact: </b>
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
