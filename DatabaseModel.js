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

  static all() {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    if (lastRow === 1) {
      return [];
    }
    const datas = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    return datas.map((data) => {
      return this.arrayToObj(data);
    });
  }

  create() {    
    const { lastRow } = this.constructor.sheetInfo();
    this.save(lastRow + 1)                
  }

  static createAll(objArray) {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const setData = objArray.map((obj) => {
      return obj.toArray();
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
    let data = this.toArray();
    const setData = [data];
    sheet.getRange(rowNum, 1, 1, lastColumn).setValues(setData);
  }

  destroy() {
    let { sheet } = this.constructor.sheetInfo();
    const primaryKey = this.constructor.primaryKey();
    const rowIndex = this.constructor.all().findIndex((e) => e[primaryKey] === this[primaryKey]);
    if (rowIndex === -1) {
      throw "This item doesn't exist in db";
    } else {
      sheet.deleteRow(rowIndex + 2);
    }
  }

  toArray() {
    let {lastColumn} = this.constructor.sheetInfo();
    let data = Array(lastColumn);
    const column = this.constructor.column();
    for (let key of Object.keys(column)) {
      let index = column[key];
      data[index] = this[key];
    }
    return data;
  }

  static arrayToObj(array) {
    let params = {};
    const column = this.column();
    for (let key of Object.keys(column)) {
      let index = column[key];
      params[key] = array[index];
    }
    return new this(params);
  }

  static first() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    if (lastRow === 1) {
      return {};
    } else {
      let data = sheet.getRange(2, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data);
    }
  }

  static second() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    if (lastRow < 3) {
      return {};
    } else {
      let data = sheet.getRange(3, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data);
    }
  }

  static last() {
    const { lastColumn, lastRow, sheet } = this.sheetInfo();
    if (lastRow === 1) {
      return {};
    } else {
      let data = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0];
      return this.arrayToObj(data);
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
