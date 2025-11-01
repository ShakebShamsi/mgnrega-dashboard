import "./App.css";
import MGNREGADashboard from "./components/Dashboard.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { LanguageProvider } from "./context/languageContext.jsx";

function App() {
   return (
      <LanguageProvider >
         <Header/>
         <MGNREGADashboard />
         <Footer/>
      </LanguageProvider>
   )
}

export default App;
