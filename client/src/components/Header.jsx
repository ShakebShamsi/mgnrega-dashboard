import { translations } from "../utils/constants";
import { useLanguage } from "../context/languageContext";


const Header = () => {
   const { language, setLanguage } = useLanguage()
   const t = translations[language];
   return (
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg">
         <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-14 h-14 bg-white rounded-full p-1" />
                  <div>
                     <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
                     <p className="text-orange-100 text-sm">{t.subtitle}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button
                     onClick={() => setLanguage('en')}
                     className={`px-3 py-1 rounded ${language === 'en' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}
                  >
                     EN
                  </button>
                  <button
                     onClick={() => setLanguage('hi')}
                     className={`px-3 py-1 rounded ${language === 'hi' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}
                  >
                     हिं
                  </button>
               </div>
            </div>
         </div>
         <hr className="text-gray-300" />
      </div>
   )
}

export default Header
