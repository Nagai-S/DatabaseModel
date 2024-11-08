# Google Apps Script Model Library

This is a Google Apps Script library that simplifies working with Google Sheets as a database. It allows you to perform basic CRUD (Create, Read, Update, Delete) operations on rows in a Google Sheet, treating each row as a model object. The library offers an easy-to-use interface for interacting with your data, with strong TypeScript support to ensure safe and efficient data management.

## Features

- **CRUD operations**: Create, Read, Update, and Delete data in Google Sheets.
- **Dynamic model handling**: Models are dynamically created based on column headers.
- **Column mappings**: Automatically maps spreadsheet columns to model properties.
- **Flexible querying**: Search, find, and filter data based on specific parameters.
- **Duplicate removal**: Automatically remove duplicate rows based on primary keys.

## Installation

1. Open your Google Apps Script project.
2. In the **"Libraries"** section, click **"Add a Library"**.
3. Enter the **Script ID** of the library. (You can find this by sharing your script and copying the ID from the URL).
4. Once added, you can begin using the library by referencing the provided classes and methods.

## Usage

### 1. **Creating a Model**

Define your custom model class by extending the `Model` class and specifying the necessary fields, including the `primaryKey` and `sheetName`.

```javascript
// Define your custom model class by extending Model
class MyModel extends Model {
  static primaryKey = "id"; // Define the primary key field
  static sheetName = "MySheet"; // Define the sheet name
}

// Creating a new instance of the model
const newModel = new MyModel({ id: 1, name: "Sample Item" });
newModel.create(); // Create a new record in the sheet

2. Retrieving Data

You can fetch all rows or a specific record using all(), first(), or find():

const allItems = MyModel.all(); // Get all records
const firstItem = MyModel.first(); // Get the first record
const item = MyModel.find({ id: 1 }); // Find a specific record by ID

3. Updating Data

Update a record by calling the update() method on the model instance.

item.name = "Updated Name";
item.update(); // Update the existing record

4. Deleting Data

To delete a record, use the destroy() method.

item.destroy(); // Delete the current record

5. Handling Duplicate Records

You can remove duplicate rows based on the primary key:

MyModel.deleteDuplicate(); // Automatically remove duplicate rows

Methods Summary

	•	create(): Creates a new record in the sheet.
	•	update(): Updates the current record in the sheet.
	•	destroy(): Deletes the current record.
	•	all(): Fetches all records from the sheet.
	•	first(): Retrieves the first record.
	•	find(): Finds a specific record based on parameters.
	•	deleteDuplicate(): Removes duplicate rows based on the primary key.

JavaScript Support

This library is written in JavaScript and designed for use with Google Apps Script. It provides an easy-to-use API for interacting with Google Sheets and handling data like a database.

License

This library is licensed under the MIT License. See the LICENSE file for more details.

Tips for Using the Library

	•	Be sure to define the primaryKey in your model, as it’s used for updating and deleting records.
	•	Use sheetName to ensure the model operates on the correct sheet within your spreadsheet.
	•	Always use find() or findAll() with caution, especially with large datasets, as fetching all records can be slow.

How to Contribute

	1.	Fork the repository.
	2.	Create a feature branch.
	3.	Commit your changes.
	4.	Open a pull request.

### Key changes:
- **JavaScript Syntax**: TypeScript-specific features like type declarations have been removed, and the code is now written in standard JavaScript, as would be used in Google Apps Script.
- **Model Definitions**: The model now uses JavaScript classes (`class MyModel extends Model`) without TypeScript's type annotations.