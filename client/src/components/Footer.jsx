import { useLanguage } from "../context/languageContext";

const Footer = () => {
   const { language } = useLanguage();

   const content = {
      en: {
         source: "Data source: Government of India Open Data Platform",
         madeBy: "Made with",
         name: "Shakeb Shamsi",
         updated: "Last updated: February 2026",
      },
      hi: {
         source: "डेटा स्रोत: भारत सरकार ओपन डेटा प्लेटफॉर्म",
         madeBy: "से बनाया गया",
         name: "शाकिब शम्सी",
         updated: "अंतिम अपडेट: फरवरी 2026",
      },
   };

   const t = content[language];

   return (
      <footer className="mt-12 border-t border-gray-800 bg-gray-900 py-8 text-white">
         <div className="mx-auto max-w-7xl px-4 text-center space-y-2">
            <p className="text-gray-400 text-sm">{t.source}</p>

            <p className="text-gray-400 text-sm">
               {t.madeBy}{" "}
               <span role="img" aria-label="love">
                  ❤️
               </span>{" "}
               {language === "hi" && "–"}{" "}
               <a
                  href="https://shakeb.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 underline underline-offset-4 hover:text-green-300 transition-colors"
               >
                  {t.name}
               </a>
               {language === "hi" && " द्वारा"}
            </p>

            <p className="text-gray-500 text-xs">{t.updated}</p>
         </div>
      </footer>
   );
};

export default Footer;
