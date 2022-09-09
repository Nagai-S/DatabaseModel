// Document: https://github.com/Nagai-S/DatabaseModel

type ssType = GoogleAppsScript.Spreadsheet.Spreadsheet;
type sheetType = GoogleAppsScript.Spreadsheet.Sheet;

type ModelAssociation = { [key in keyof Model]: any };

class Model {
  [key: string]: any;

  constructor(params: { [key: keyof Model]: any }) {
    Object.assign(this, params);
  }

  static primaryKey: string = "";

  static column: { [key in keyof Model]?: number } = {};

  static spreadsheet: ssType;

  static sheetName: string = "";

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

  create(this: ModelAssociation): ModelAssociation {
    return this.save();
  }

  static createAll(objArray: ModelAssociation[]): ModelAssociation[] {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn);
    const setData = objArray.map((obj) => {
      return obj.toArray(columnNum);
    });
    sheet
      .getRange(lastRow + 1, 1, setData.length, lastColumn)
      .setValues(setData);
    return objArray;
  }

  update(this: ModelAssociation): ModelAssociation {
    const thisClass: typeof Model = this.constructor as typeof Model;
    const primaryKey: string = thisClass.primaryKey;
    const rowIndex = thisClass
      .all()
      .findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw "This item doesn't exist in database";
    } else {
      return this.save(rowIndex + 2);
    }
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

  destroy(this: ModelAssociation): void {
    const thisClass: typeof Model = this.constructor as typeof Model;
    let { sheet } = thisClass.sheetInfo();
    const primaryKey = thisClass.primaryKey;
    const rowIndex = thisClass
      .all()
      .findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw "This item doesn't exist in database";
    } else {
      sheet.deleteRow(rowIndex + 2);
    }
  }

  toArray(columnNum: { [key in keyof Model]?: number }): any[] {
    const arraySize = Object.keys(columnNum).length;
    let data = Array(arraySize);
    for (let key of Object.keys(columnNum)) {
      let index = columnNum[key];
      data[index] = this[key];
    }
    return data;
  }

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
}
