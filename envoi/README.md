


# Games Manager API
**Student:** Nathan Fondimare
**Serie:** BIN5

## Description
This is a REST API developed for the "Développement web : bases" course. It manages sports games, teams, and fields. The project follows a layered architecture (Controllers, Services, Mappers, Models) and uses JSON files for data persistence.

## Installation
Before running the server, make sure to install all the necessary dependencies:
```bash
npm install
```

### Available Scripts

In the project directory, you can run the following commands:
```bash
npm run build
```

Compiles the TypeScript code into JavaScript in the dist folder and watches for changes.
```bash
npm run dev
```

Starts the server using the compiled files in the dist folder with a watcher. The server will restart automatically when the code is updated.
```bash
npm run start
```

Populates JSON files with test data.
```bash
npm run demo:seed
```

Resets the database to its initial state.
```bash
npm run demo:reset
```

Dumps all JSON file resources.
```bash
npm run demo:clear
```

