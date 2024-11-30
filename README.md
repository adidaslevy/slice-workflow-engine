<p align="center">
  <img src="slice_global.svg" width="200" alt="Slice Logo" /></a>
</p>


  <p align="center">A workflow engine demonstration, as required for interview</p>
    <p align="center">

## Description

This workflow engine is a basic work, in order to demonstrate how steps can be combined to a single workflow, and how a workflow can be achived using small building blocks.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Freestyle running 

The workflow engine supports two endpoints:

### Adding a workflow 

1. ```POST http://localhost:3000/workflow```

In order to add a workflow, run this endpoint, and add a body: 

```
{
    "id": "workflow1",
    "steps": [
    {
      "id": "step1",
        "type": { 
            "kind": "SEND_EMAIL", 
            "email": ["test1@example.com", "test2@example.com"], 
            "subject": "Hello"
        }
    },
    {
        "id": "step2",
        "type": { 
            "kind": "UPDATE_GRANT", 
            "grantId": "123", 
            "newStatus": "ACTIVE" 
        },
        "dependencies": ["step1"]
    }
  ]
}
```

This will save the workflow in internal memory of the workflow engine. 

2. ```POST http://localhost:3000/workflow/workflow1/run```

This will run the workflow, and you'll be able to see the running process in the terminal console. 