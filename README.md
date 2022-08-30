# DatabaseModel
## Description
### Library of Google App Script
You can create database model class with ease and you can use some methods.

## Source Code
[DatabaseModel.js](https://github.com/Nagai-S/DatabaseModel/blob/main/DatabaseModel.js)

## How to use
1. Add library with id: "1urlrIRVTLZrQL3iFOPmrxBANfgw6478VDTrsnsOChUOQF0a3yw8HK5wr".
2. Create a sheet for a database with name: "Your Sheet Name".
3. Create a Class following example codes.
````js
const Model = DatabaseModel.DatabaseModel();

class YourClassName extends Model {
  constructor(params) {
    super(params);
  }
  
  static primaryKey() {
    return 'id'
  }

  // optional  
  static column() {
    return{
      id: 0,          
    }
  }

  static spreadsheet(){
    return SpreadsheetApp.getActive();
  }

  static sheetName() {
    return 'Your Sheet Name'
  }
}
````
### Example sheet
|A|B|C|
|---|---|---|
|key1|key2|key3|
|data|data|data|
|data|data|data|

* You can set an integer(>=0) as the value of a property in `static column()` if you want to use different property name from the column name of database. When you want to change the property name associated with column A, you can set `{newPropertyName: 0}`, when column B, `{newPropertyName: 1}`, when column C, `{newPropertyName: 2}` ...
* You can set a string of a property name that is identifier of the datas in `static primaryKey()`.

## Methods
### Initialize
````js
let foo = new YourClassName({id: 'aaa', key2: 'bbb'}); 
// You can create an instance of 'YourClassName'
let val1 = foo.id; 
// You can set 'aaa' in 'val1'
let val2 = foo.key2; 
// You can set 'bbb' in 'val2'
foo.key3 = 'ccc';  
// You can set 'ccc' in the property of 'key3' of the instance 'foo';
````

### `object.create()`
````js
let foo = new YourClassName({id: 'aaa', key2: 'bbb', key3: 'ccc'});
foo.create();
````
You can save a data 'foo' in a new row of the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|ccc|

### `Class.create_all(objArray)`
````js
const foo2 = new YourClassName({id: 'bbb', key3: 'ccc'});
const bar = new YourClassName({id: 'ccc', key2: 1000});
YourClassName.create_all([foo2, bar]);
````
You can save all datas 'foo2' and 'bar' in new rows of the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|ccc|
|bbb||ccc|
|ccc|1000||

### `Class.all()`
````js
const datas = YourClassName.all(); 
// return
// [
//   {id: 'aaa', key2: 'bbb', key3: 'ccc'},
//   {id: 'bbb', key2: '', key3: 'ccc'},
//   {id: 'ccc', key2: 1000, key3: ''},
// ]
````
Return an array of the object of 'YourClassName' of all datas saved in database sheet.

### `Class.findAll(params)`
````js
const datas = YourClassName.findAll({key3: 'ccc'});
// return
// [
//   {id: 'aaa', key2: 'bbb', key3: 'ccc'},
//   {id: 'bbb', key2: '', key3: 'ccc'},
// ]
````
Return an array of the object of 'YourClassName' of all datas that match argument 'params'.

Argument can have some keys and properties, and the method returns all datas that match all keys and properties (AND SEARCH).

### `Class.find(params)`
````js
const datas = YourClassName.find({id: 'aaa'}); 
// return
// {id: 'aaa', key2: 'bbb', key3: 'ccc'}
````
Return first object of 'YourClassName' of data that matches argument 'params'.

Argument can have some keys and properties, and the method returns first data that matches all keys and properties (AND SEARCH).

### `object.update(obj)`
````js
const foo = YourClassName.find({id: 'aaa', key2: 'bbb'});
foo.key3 = 2000;
foo.update()
````
You can update the data 'foo' in the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|2000|
|aaa||eee|
|abab|1000||

### There are other methods. You can see them in the source code.

