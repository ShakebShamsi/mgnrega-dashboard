import { useLanguage } from "../context/languageContext";

const Footer = () => {
   const { language } = useLanguage();

   return (
      <div className="bg-gray-900 text-white py-8 mt-12">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400">
               {language === 'en'
                  ? 'Data source: Government of India Open Data Platform'
                  : 'डेटा स्रोत: भारत सरकार ओपन डेटा प्लेटफॉर्म'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
               {language === 'en' ? (
                  <>
                     Made with ❤️ by{" "}
                     <a
                        href="https://shakeb.onrender.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-green-300 underline transition-colors"
                     >
                        Shakeb Shamsi
                     </a>
                  </>
               ) : (
                  <>
                     ❤️ से बनाया गया -{" "}
                     <a
                        href="https://shakeb.onrender.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-green-300 underline transition-colors"
                     >
                        शाकिब शम्सी
                     </a>{" "}
                     द्वारा
                  </>
               )}
            </p>

            <p className="text-gray-400 text-sm mt-2">
               {language === 'en'
                  ? 'Last updated: February 2026'
                  : 'अंतिम अपडेट: फरवरी 2026'}
            </p>
         </div>
      </div>
   )
}

export default Footer;
