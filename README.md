# Creator Trust

## Description

Creator Trust is an AI-powered platform that evaluates influencer authenticity and recommends fair pricing using behavioral signals. Build with Random Forest Model, Fast API Backend and Next.js Frontend.

## Installation

Follow these steps to install the project:

```bash
npm install
```

## Usage

You can run the following scripts:

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`

## Dependencies

This project uses the following dependencies:

- @base-ui/react
- @radix-ui/react-slider
- blytz
- class-variance-authority
- clsx
- framer-motion
- lucide-react
- next
- react
- react-dom
- recharts
- shadcn
- tailwind-merge
- tw-animate-css

## Folder Structure

Project structure:

```
├── ml-engine/ # ML backend (FastAPI + model logic)
│ ├── main.py
│ ├── model_service.py
│ ├── contract_service.py
│ ├── trainer.py
│ └── requirements.txt

├── models/ # Trained ML models & artifacts
│ ├── authenticity_rf_model.pkl
│ ├── feature_scaler.pkl
│ └── feature_names.pkl

├── public/ # Static assets
│ └── *.svg

├── src/
│ ├── app/ # Next.js app router
│ ├── components/ # UI + dashboard components
│ └── lib/ # Utility functions

├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## License

Add your license information here.

## Built By

Built with ❤️ by @Aryan Sharma