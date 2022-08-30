// Document: https://github.com/Nagai-S/DatabaseModel

class Model {
  constructor(params) {    
    for (let key of Object.keys(params)) {
      this[key] = params[key];
    }    
  }

  static primaryKey() {
    return '';
  }

  static column() {
    return {};
  }

  static spreadsheet() {
    return "";
  }

  static sheetName() {
    return "";
  }

  static sheetInfo() {
    const ss = this.spreadsheet();
    const sheet = ss.getSheetByName(this.sheetName());   
    return {
      sheet: sheet,
      lastRow: sheet.getDataRange().getLastRow(),
      lastColumn: sheet.getDataRange().getLastColumn(),      
    }; 
  }

  static getColumnNum(sheet, lastColumn){
    const propNames = sheet.getRange(1,1,1,lastColumn).getValues();
    let columnNum = {}
    for (let i=0; i<lastColumn; i++) {
      if(propNames[0][i]) {
        columnNum[propNames[0][i]] = i;
      }
    }
    const specifiedColumn = this.column();
    for (let value of Object.values(specifiedColumn)) {
      let dupKey = Object.keys(columnNum).find((key) => columnNum[key] === value);
      delete columnNum[dupKey]
    }    
    return Object.assign(columnNum, specifiedColumn);
  }

  static all() {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn)
    if (lastRow === 1) {
      return [];
    }
    const datas = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    return datas.map((data) => {
      return this.arrayToObj(data, columnNum);
    });
  }

  create() {    
    const { lastRow } = this.constructor.sheetInfo();
    this.save(lastRow + 1)                
  }

  static createAll(objArray) {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn)
    const setData = objArray.map((obj) => {
      return obj.toArray(columnNum);
    });
    sheet
      .getRange(lastRow + 1, 1, setData.length, lastColumn)
      .setValues(setData);
  }

  update() {
    const primaryKey = this.constructor.primaryKey();
    const rowIndex = this.constructor.all().findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw "This item doesn't exist in database";
    } else {      
      this.save(rowIndex + 2);
    }
  }

  save(rowNum) {
    let { sheet, lastColumn } = this.constructor.sheetInfo();
    const columnNum = this.constructor.getColumnNum(sheet, lastColumn)
    let data = this.toArray(columnNum);
    const setData = [data];
    sheet.getRange(rowNum, 1, 1, lastColumn).setValues(setData);
  }

  destroy() {
    let { sheet } = this.constructor.sheetInfo();
    const primaryKey = this.constructor.primaryKey();
    const rowIndex = this.constructor.all().findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw "This item doesn't exist in database";
    } else {
      sheet.deleteRow(rowIndex + 2);
    }
  }

  toArray(columnNum) {
    const arraySize = Object.keys(columnNum).length
    let data = Array(arraySize);
    for (let key of Object.keys(columnNum)) {
      let index = columnNum[key];
      data[index] = this[key];
    }
    return data;
  }  

  static arrayToObj(array,columnNum) {
    let params = {};    
    for (let key of Object.keys(columnNum)) {
      let index = columnNum[key];
      params[key] = array[index];
    }
    return new this(params);
  }

  static first() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn)
    if (lastRow === 1) {
      return {};
    } else {
      let data = sheet.getRange(2, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static second() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn)
    if (lastRow < 3) {
      return {};
    } else {
      let data = sheet.getRange(3, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static last() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    const columnNum = this.getColumnNum(sheet, lastColumn)
    if (lastRow === 1) {
      return {};
    } else {
      let data = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data, columnNum);
    }
  }

  static findAll(params) {
    return this.all().filter((obj) => {
      return Object.keys(params).every((key) => params[key] === obj[key]);
    });
  }

  static find(params) {
    let allData = this.findAll(params);
    return allData[0];
  }
}

function DatabaseModel() {
  return Model;
}