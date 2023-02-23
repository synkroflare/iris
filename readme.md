# ARAUTA ALABARDA

## Setup Instructions for Development

- Install the dependencies: run `npm install` in project terminal
- Configure the environment variables

## How to configure your environment variables?

- Create a new .env file in the project root
- Inside set the following environment variables:

```
<!-- (mandatory)-->
DATABASE_URL = "localhost:3000"
```

Install the dependencies
`npm install --save`

## How to run the project?

- Run the project: run `npm run dev` in project terminal
- Run the migrations: run `npx prisma migrate dev` in project terminal
