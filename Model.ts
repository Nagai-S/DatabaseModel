// Document: https://github.com/Nagai-S/DatabaseModel
/**
 * Google Apps Script Library: DatabaseModel
 * 
 * Provides a class for interacting with a Google Sheets spreadsheet
 * as if it were a database, supporting CRUD operations and more.
 */
type ssType = GoogleAppsScript.Spreadsheet.Spreadsheet;
type sheetType = GoogleAppsScript.Spreadsheet.Sheet;

type ModelAssociation = { [key in keyof Model]: any };

class Model {
  [key: string]: any;

  constructor(params: { [key: keyof Model]: any }) {
    Object.assign(this, params);
  }
  /**
   * The primary key column for the model.
   * @type {string}
   */
  static primaryKey: string = "";
  /**
   * Maps column names to their respective indices in the spreadsheet.
   * @type {{ [key in keyof Model]?: number }}
   */
  static column: { [key in keyof Model]?: number } = {};
  /**
   * Reference to the spreadsheet.
   * @type {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  static spreadsheet: ssType;
  /**
   * Name of the sheet within the spreadsheet.
   * @type {string}
   */
  static sheetName: string = "";
  /**
   * Retrieves metadata about the sheet (e.g., last row/column).
   * @return {Object} Information about the sheet.
   * @property {sheetType} sheet The sheet object.
   * @property {number} lastRow The last row with data.
   * @property {number} lastColumn The last column with data.
   * @example
   * const info = Model.sheetInfo();
   * Logger.log(`Last row: ${info.lastRow}, Last column: ${info.lastColumn}`);
   */
  static sheetInfo(): {
    sheet: sheetType;
    lastRow: number;
    lastColumn: number;
  } {
    const ss: ssType = this.spreadsheet;
    const sheet: sheetType = ss.getSheetByName(this.sheetName);
    return {
      sheet: sheet,
      lastRow: sheet.getDataRange().getLastRow(),
      lastColumn: sheet.getDataRange().getLastColumn(),
    };
  }
  /**
   * Maps column names to their respective indices.
   * @param {sheetType} sheet The sheet to analyze.
   * @param {number} lastColumn The number of columns in the sheet.
   * @return {Object} A map of column names to indices.
   * @example
   * const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   * const columnMap = Model.getColumnNum(sheet, 10);
   * Logger.log(columnMap);
   */
  static getColumnNum(
    sheet: sheetType,
    lastColumn: number
  ): { [key in keyof Model]?: number } {
    const propNames = sheet.getRange(1, 1, 1, lastColumn).getValues();
    let columnNum: { [key in keyof Model]?: number } = {};
    for (let i = 0; i < lastColumn; i++) {
      if (propNames[0][i]) {
        columnNum[propNames[0][i]] = i;
      }
    }
    const specifiedColumn = this.column;
    for (let value of Object.values(specifiedColumn)) {
      let dupKey = Object.keys(columnNum).find(
        (key) => columnNum[key] === value
      );
      delete columnNum[dupKey];
    }
    return Object.assign(columnNum, specifiedColumn);
  }
  /**
   * Retrieves all rows as objects.
   * @return {ModelAssociation[]} An array of rows as objects.
   * @example
   * const allRecords = Model.all();
   * allRecords.forEach(record => Logger.log(record));
   */
  static all(): ModelAssociation[] {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    if (lastRow === 1) {
      return [];
    }
    const datas = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    return datas.map((data) => {
      return this.arrayToObj(data, columnNum);
    });
  }
  /**
   * Creates and saves the current object to the sheet.
   * @return {ModelAssociation} The saved object.
   * @example
   * const record = new Model({ id: 1, name: "John Doe" });
   * record.create();
   */
  create(this: ModelAssociation): ModelAssociation {
    return this.save();
  }
  /**
   * Saves an array of objects to the sheet.
   * @param {ModelAssociation[]} objArray Array of objects to save.
   * @return {ModelAssociation[]} The saved objects.
   * @example
   * const records = [
   *   new Model({ id: 1, name: "Alice" }),
   *   new Model({ id: 2, name: "Bob" }),
   * ];
   * Model.createAll(records);
   */
  static createAll(objArray: ModelAssociation[]): ModelAssociation[] {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    if (objArray.length == 0) return objArray;
    const setData = objArray.map((obj) => {
      return obj.toArray(columnNum);
    });
    sheet
      .getRange(lastRow + 1, 1, setData.length, lastColumn)
      .setValues(setData);
    return objArray;
  }
  /**
   * Updates the current object in the sheet.
   * @throws Will throw an error if the primary key value is not found.
   * @return {ModelAssociation} The updated object.
   * @example
   * const record = Model.find({ id: 1 });
   * record.name = "Updated Name";
   * record.update();
   */
  update(this: ModelAssociation): ModelAssociation {
    const thisClass: typeof Model = this.constructor as typeof Model;
    const primaryKey: string = thisClass.primaryKey;
    const rowIndex = thisClass
      .all()
      .findIndex((e) => e[primaryKey] === this[primaryKey]);

    if (rowIndex === -1) {
      throw new Error(
        `Item with primaryKey ${this[primaryKey]} not found in database.`
      );
    } else {
      return this.save(rowIndex + 2);
    }
  }
  
  static findAndUpdate(params: object, updateValues: object): ModelAssociation {
    const item = this.find(params);
    if (!item) {
      throw "Record not found";
    }
    Object.assign(item, updateValues);
    return item.update();
  }

  static updateWhere(condition: object, updateValues: object): void {
    const records = this.findAll(condition);
    records.forEach((record) => {
      Object.assign(record, updateValues);
      record.update();
    });
  }

  static cacheData(): ModelAssociation[] {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get("allData");
    if (cachedData) {
      return JSON.parse(cachedData);
    } else {
      const allData = this.all();
      cache.put("allData", JSON.stringify(allData), 1500); // Cache for 25 minutes
      return allData;
    }
  }

  static mergeRecords(
    record1: ModelAssociation,
    record2: ModelAssociation
  ): ModelAssociation {
    const mergedData = Object.assign({}, record1, record2);
    return new this(mergedData);
  }

  save(this: ModelAssociation, saveNum: number = 0): ModelAssociation {
    const thisClass: typeof Model = this.constructor as typeof Model;
    let { sheet, lastColumn, lastRow } = thisClass.sheetInfo();
    if (saveNum == 0) saveNum = lastRow + 1;
    const columnNum = thisClass.getColumnNum(sheet, lastColumn);
    let data = this.toArray(columnNum);
    const setData = [data];
    sheet.getRange(saveNum, 1, 1, lastColumn).setValues(setData);
    return this;
  }
   /**
   * Deletes the current object from the sheet.
   * @throws Will throw an error if the object is not found.
   * @example
   * const record = Model.find({ id: 1 });
   * record.destroy();
   */
  destroy(this: ModelAssociation): void {
    const thisClass: typeof Model = this.constructor as typeof Model;
    let { sheet } = thisClass.sheetInfo();
    const primaryKey = thisClass.primaryKey;
    const rowIndex = thisClass
      .all()
      .findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw `Item with primaryKey ${this[primaryKey]} not found in database.`;
    } else {
      sheet.deleteRow(rowIndex + 2);
    }
  }

  static destroyAll(records: ModelAssociation[]): void {
    const primaryKey = this.primaryKey;
    const { sheet } = this.sheetInfo();
    const rowsToDelete = records
      .map((record) => {
        const rowIndex =
          this.all().findIndex(
            (item) => item[primaryKey] === record[primaryKey]
          ) + 2;
        return rowIndex;
      })
      .sort((a, b) => b - a); // Delete from the bottom to avoid shifting rows

    rowsToDelete.forEach((rowIndex) => {
      sheet.deleteRow(rowIndex);
    });
  }
  /**
   * Converts the object to an array based on the column indices.
   * @param {Object} columnNum Mapping of column names to indices.
   * @return {any[]} The object as an array.
   * @example
   * const columnMap = Model.getColumnNum(sheet, 10);
   * const recordArray = record.toArray(columnMap);
   * Logger.log(recordArray);
   */
  toArray(columnNum: { [key in keyof Model]?: number }): any[] {
    const arraySize = Object.keys(columnNum).length;
    let data = Array(arraySize);
    for (let key of Object.keys(columnNum)) {
      let index = columnNum[key];
      data[index] = this[key];
    }
    return data;
  }
  /**
   * Converts an array to an object based on the column indices.
   * @param {any[]} array The array representing the row data.
   * @param {Object} columnNum Mapping of column names to indices.
   * @return {ModelAssociation} The array as an object.
   * @example
   * const array = ["Alice", 25];
   * const columnMap = { name: 0, age: 1 };
   * const record = Model.arrayToObj(array, columnMap);
   * Logger.log(record);
   */
  static arrayToObj(
    array: any[],
    columnNum: { [key in keyof Model]?: number }
  ): ModelAssociation {
    let params: { [key in keyof Model]?: any } = {};
    for (let key of Object.keys(columnNum)) {
      let index = columnNum[key];
      params[key] = array[index];
    }
    return new this(params);
  }

  static first(): ModelAssociation {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    if (lastRow === 1) {
      return new this({});
    } else {
      let data = sheet.getRange(2, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static second(): ModelAssociation {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    if (lastRow < 3) {
      return new this({});
    } else {
      let data = sheet.getRange(3, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static last(): ModelAssociation {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    if (lastRow === 1) {
      return new this({});
    } else {
      let data = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static findAll(params: object): ModelAssociation[] | [] {
    return this.all().filter((obj) => {
      return Object.keys(params).every((key) => params[key] === obj[key]);
    });
  }

  static find(params: object): ModelAssociation {
    let allData = this.findAll(params);
    return allData.length > 0 ? allData[0] : new this({});
  }

  static getByPrimaryKey(primaryKeyValue: any): ModelAssociation {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    const datas = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();

    const record = datas.find(
      (data) => data[columnNum[this.primaryKey]] === primaryKeyValue
    );
    return record ? this.arrayToObj(record, columnNum) : null;
  }

  static exist(params: object): boolean {
    let searchResult = this.find(params);
    return Object.keys(searchResult).length > 0;
  }

  static deleteDuplicate(): boolean {
    let allData = this.all();
    let uniqDataArray = [];
    allData.forEach((data) => {
      if (uniqDataArray.indexOf(data[this.primaryKey]) > -1) {
        data.destroy();
      } else {
        uniqDataArray.push(data[this.primaryKey]);
      }
    });
    return true;
  }

  equal(
    this: ModelAssociation,
    compared_obj: ModelAssociation,
    compared_keys: string[] = []
  ): boolean {
    if (compared_keys.length == 0) {
      compared_keys = Object.keys(this);
    }
    return compared_keys.every((key) => this[key] == compared_obj[key]);
  }
}
