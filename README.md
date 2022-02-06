# DatabaseModel
## Description
### Library of Google App Script
You can create database model class with ease and you can use some methods.

## How to use
1. Add library with id: "1urlrIRVTLZrQL3iFOPmrxBANfgw6478VDTrsnsOChUOQF0a3yw8HK5wr".
2. Create a sheet for a database with name: "Your Sheet Name".
3. Create a Class following example codes.
````js
const Model = DatabaseModel.DatabaseModel();

class YourClassName extends Model {
  constructor(params) {
    super(params, 'your_primary_key');
  }

  static column() {
    return{
      key1: 0,
      key2: 1,
      key3: 2,
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

* You can set an integer(>=0) in 'column_number'. When you want to save datas associated a 'key1' in column A, set 0 in property of 'key1' in static method 'column()', when column B, set 1, and when column C, set 2, ... and so on.
* You can set a string of a key name that is identifier of the datas in 'your_primary_key'.

## Methods
### Initialize
````js
let foo = new YourClassName({key1: 'aaa', key2: 'bbb'}); 
// You can create an instance of 'YourClassName'
let val1 = foo.key1; 
// You can set 'aaa' in 'val1'
let val2 = foo.key2; 
// You can set 'bbb' in 'val2'
foo.key3 = 'ccc';  
// You can set 'ccc' in the property of 'key3' of the instance 'foo';
````

### ````Class.create(obj)````
````js
let foo = new YourClassName({key1: 'aaa', key2: 'bbb'});
YourClassName.create(foo);
````
You can save a data 'foo' in a new row of the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|ccc|

### ````Class.create_all(objArray)````
````js
const foo2 = new YourClassName({key1: 'aaa', key3: 'eee'});
const bar = new YourClassName({key1: 'abab', key2: 1000});
YourClassName.create_all([foo2, bar]);
````
You can save all datas 'foo2' and 'bar' in a new row of the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|ccc|
|aaa||eee|
|abab|1000||

### ````Class.all()````
````js
const datas = YourClassName.all(); 
````
Return an array of all datas at the type of 'YourClassName' (ex. [foo, foo2, bar])

### ````Class.findAll(params)````
````js
const datas = YourClassName.findAll({key1: 'aaa'}); 
````
Return an array of datas that match argument 'params' at the type of 'YourClassName' (ex. [foo, foo2])

Argument can have some keys and properties, and the method returns all of datas that match all keys and properties.

### ````Class.find(params)````
````js
const datas = YourClassName.findAll({key1: 'aaa'}); 
````
Return an first data that matches argument 'params' at the type of 'YourClassName' (ex. foo)

Argument can have some keys and properties, and the method returns an first data that matches all keys and properties.

### ````Class.update(obj)````
````js
const foo = YourClassName.find({key1: 'aaa', key2: 'bbb'});
foo.key3 = 2000;
YourClassName.update(foo)
````
You can update the data 'foo' in the database sheet 'Your Sheet Name' and the sheet is like the following.
|A|B|C|
|---|---|---|
|key1|key2|key3|
|aaa|bbb|2000|
|aaa||eee|
|abab|1000||

