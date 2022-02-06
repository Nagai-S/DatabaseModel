class Model {
  constructor(params, primaryKey) {
    this.id = params[primaryKey];
    for (let key of Object.keys(params)) {
      this[key] = params[key];
    }
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
      let params = {};
      const column = this.column();
      for (let key of Object.keys(column)) {
        let index = column[key];
        params[key] = data[index];
      }
      return new this(params);
    });
  }

  static create(obj) {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    this.save({
      obj: obj,
      rowNum: lastRow + 1,
      sheet: sheet,
      lastColumn: lastColumn,
    });
  }

  static createAll(objArray) {
    const { sheet, lastRow, lastColumn } = this.sheetInfo();
    const setData = objArray.map((obj) => {
      return this.objToArray({ obj: obj, lastColumn: lastColumn });
    });
    sheet
      .getRange(lastRow + 1, 1, setData.length, lastColumn)
      .setValues(setData);
  }

  static update(obj) {
    const { sheet, lastColumn } = this.sheetInfo();
    const rowIndex = this.all().findIndex((e) => e.id === obj.id);
    if (rowIndex === -1) {
      throw "This item doesn't exist in db";
    } else {
      this.save({
        obj: obj,
        rowNum: rowIndex + 2,
        sheet: sheet,
        lastColumn: lastColumn,
      });
    }
  }

  static save({ obj, rowNum, sheet, lastColumn }) {
    let data = this.objToArray({ obj: obj, lastColumn: lastColumn });
    const setData = [data];
    sheet.getRange(rowNum, 1, 1, data.length).setValues(setData);
  }

  static objToArray({ obj, lastColumn }) {
    let data = Array(lastColumn);
    const column = this.column();
    for (let key of Object.keys(column)) {
      let index = column[key];
      data[index] = obj[key];
    }
    return data;
  }

  static first() {
    let allData = this.all();
    if (allData.length === 0) {
      return {};
    }
    return allData[0];
  }

  static last() {
    let allData = this.all();
    if (allData.length === 0) {
      return {};
    }
    return allData[allData.length - 1];
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
