# openai-gas

Adds custom function that generates text (`OpenAIComplete`) to your spreadsheet.

## Configure

### Create Google Apps Script Project

This project uses [clasp](https://github.com/google/clasp).

You can create a new Google Apps Script project by following command.

```sh
clasp create --type sheets --title "Your Project Title"
```

You can push your local project to Google Apps Script project by following command.

```sh
clasp push
```

### Configure Script Properties

Add following script properties to your Google Apps Script project.

- `OPENAI_API_KEY`: OpenAI API key
