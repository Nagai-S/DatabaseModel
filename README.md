# Google Apps Script Library: Database Model

This is a Google Apps Script library that simplifies working with Google Sheets as a database. It allows you to perform basic CRUD (Create, Read, Update, Delete) operations on rows in a Google Sheet, treating each row as a model object. The library offers an easy-to-use interface for interacting with your data, with strong TypeScript support to ensure safe and efficient data management.

## Table of Contents

- [Google Apps Script Library: Database Model](#google-apps-script-library-database-model)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Setup](#basic-setup)
    - [Retrieving Data](#retrieving-data)
    - [Deleting Data](#deleting-data)
    - [Handling Duplicate Records](#handling-duplicate-records)
  - [Spreadsheet Examples](#spreadsheet-examples)
    - [Example Table Before and After Method Execution](#example-table-before-and-after-method-execution)
      - [Method: create](#method-create)
      - [Method: update](#method-update)
      - [Method: destroy](#method-destroy)
  - [Adding Custom Functions](#adding-custom-functions)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The **Database Model** library allows developers to interact with Google Sheets as structured data models, enabling easier management of rows, columns, and their mappings. It includes utilities for:

- Fetching and updating spreadsheet data.
- Searching for spreadsheet data
- Managing metadata like primary keys and sheet names.

## Features

- **CRUD operations**: Create, Read, Update, and Delete data in Google Sheets.
- **Dynamic model handling**: Models are dynamically created based on column headers.
- **Column mappings**: Automatically maps spreadsheet columns to model properties.
- **Flexible querying**: Search, find, and filter data based on specific parameters.
- **Duplicate removal**: Automatically remove duplicate rows based on primary keys.

## Installation

To use this library:

1. Open your Google Apps Script project.
2. Click on the menu: `Extensions > Libraries`.
3. In the "Add a library" dialog, input the script ID of this library:
   ```
   1urlrIRVTLZrQL3iFOPmrxBANfgw6478VDTrsnsOChUOQF0a3yw8HK5wr
   ```
4. Select the latest version and click "Add".

## Usage

### Basic Setup

To begin using the library, you need to configure your model:

```typescript
class MyModel extends Model {
  constructor(params) {
    super(params);
  }
}
MyModel.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
MyModel.sheetName = "Sheet1"; // Define the sheet name
MyModel.primaryKey = "id"; // Define your primary key.

// Example: Initialize a model
const modelInstance = new MyModel({ id: 1, name: "John Doe" });
modelInstance.create(); // Create a new record in the sheet
```

### Retrieving Data

You can fetch all rows or a specific record using all(), first(), or find():

```typescript
const allItems = MyModel.all(); // Get all records
const firstItem = MyModel.first(); // Get the first record
const item = MyModel.find({ id: 1 }); // Find a specific record by ID
```

### Deleting Data

To delete a record, use the destroy() method.

```typescript
modelInstance.destroy(); // Delete the current record
```

### Handling Duplicate Records

You can remove duplicate rows based on the primary key:

```typescript
MyModel.deleteDuplicate(); // Automatically remove duplicate rows
```

## Spreadsheet Examples

### Example Table Before and After Method Execution

**Initial Spreadsheet (Before Any Operations):**

| ID  | Name       | Email            |
| --- | ---------- | ---------------- |
| 1   | John Doe   | john@example.com |
| 2   | Jane Smith | jane@example.com |

#### Method: create

```typescript
const modelInstance = new MyModel({
  ID: 3,
  Name: "Alice",
  Email: "alice@example.com",
});
modelInstance.create();
```

**Updated Spreadsheet:**

| ID  | Name       | Email             |
| --- | ---------- | ----------------- |
| 1   | John Doe   | john@example.com  |
| 2   | Jane Smith | jane@example.com  |
| 3   | Alice      | alice@example.com |

---

#### Method: update

```typescript
let john = MyModel.find({ ID: 1 });
john.Name = "Johnathan Doe";
john.update();
```

**Updated Spreadsheet:**

| ID  | Name          | Email             |
| --- | ------------- | ----------------- |
| 1   | Johnathan Doe | john@example.com  |
| 2   | Jane Smith    | jane@example.com  |
| 3   | Alice         | alice@example.com |

---

#### Method: destroy

```typescript
let alice = MyModel.find({ ID: 3 });
alice.destroy();
```

**Updated Spreadsheet:**

| ID  | Name          | Email            |
| --- | ------------- | ---------------- |
| 1   | Johnathan Doe | john@example.com |
| 2   | Jane Smith    | jane@example.com |

---

## Adding Custom Functions

Developers can extend the library with custom methods for additional operations.

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## License

This project is licensed under the MIT License.
