# MGNREGA Dashboard  
> 🌾 Visualizing India’s Rural Employment Data with React + Open Government APIs

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.7-orange?logo=vite)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4.1.16-38BDF8?logo=tailwind-css)
![License](https://img.shields.io/badge/License-Educational-green)
![API](https://img.shields.io/badge/Data%20Source-data.gov.in-blue)

---

## 📘 Overview

The **MGNREGA Dashboard** is a modern web application that visualizes district-level performance data from the  
**Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)**.

It fetches **live data from the Government of India’s Open API** and turns it into **interactive charts and metrics** for easy public understanding.  
Users can filter by **State**, **District**, and **Financial Year** to explore employment trends, expenditure, and progress.

---

## 🎯 Objectives

- Simplify access to government MGNREGA data  
- Enable **citizens and researchers** to visualize district-level performance  
- Promote **data transparency and literacy** through easy-to-understand visuals  

---

## ⚙️ Tech Stack

| Category | Technology |
|-----------|-------------|
| 🖥️ **Frontend** | React 19 |
| 🧭 **Routing** | React Router DOM |
| 📊 **Visualization** | Recharts |
| 🌐 **HTTP Client** | Axios |
| 🎨 **Styling** | Tailwind CSS |
| 💡 **Icons** | Lucide React |
| ⚡ **Build Tool** | Vite |
| 🔍 **Linting** | ESLint |

---

## 📁 Folder Structure
<details>
<summary>Click to expand</summary>
mgnrega-dashboard/
│
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level views like Dashboard
│ ├── utils/ # Helper functions (e.g., number formatter)
│ ├── App.jsx # Main routing and layout
│ ├── main.jsx # App entry point
│ └── index.css # Global Tailwind setup
│
├── .eslintrc.js # ESLint configuration
├── tailwind.config.js # Tailwind config
├── vite.config.js # Vite build config
├── package.json # Dependencies and scripts
└── README.md # Project documentation

</details>

---

## 🧩 Features

✅ **Dynamic Filters**
- Select State, District, and Financial Year  
- Dashboard updates automatically  

📊 **Interactive Charts**
- Line, Bar, and Pie charts with Recharts  
- Responsive and smooth animations  

📈 **Live Data Metrics**
- Workers, expenditure, person-days, completion rates  

⚠️ **Error & Loading States**
- Graceful fallbacks for empty or failed API calls  

📱 **Responsive Design**
- Optimized for both desktop and mobile users  

---

## 🌐 API Integration

**Source:** [data.gov.in – MGNREGA District Performance](https://data.gov.in/catalog/mahatma-gandhi-national-rural-employment-guarantee-act-mgnrega)

### Endpoint
https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722



### Parameters
| Parameter | Description | Example |
|------------|--------------|----------|
| `api-key` | Your API key from data.gov.in | `12345abc...` |
| `format` | Response format | `json` |
| `limit` | No. of records to fetch | `100` |
| `filters[state_name]` | Selected state | `Bihar` |
| `filters[district_name]` | Selected district | `Muzaffarpur` |
| `filters[fin_year]` | Financial year | `2024-2025` |

---

## 🔁 Data Mapping
| Dashboard Field | API Field |
|------------------|-----------|
| District Name | `district_name` |
| Total Workers | `total_workers` |
| Households Benefited | `households_benefited` |
| Person-days Generated | `persondays_generated_lakhs` |
| Total Expenditure | `total_expenditure_crores` |
| Average Wage | `avg_wage_per_day` |
| Work Completion Rate | `work_completion_rate` |

---

👨‍💻 Developer

Author: Shakeb Hassan Shamsi

Role: Fullstack Developer

Expertise: Data Analytics | MERN Stack | Data Visualization

Location: India

🏁 License

This project is for educational and public data transparency purposes only.
All datasets are sourced from the Government of India’s data.gov.in
 Open Data API.


