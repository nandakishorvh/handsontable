import HyperFormula from 'hyperformula';

describe('Formulas: Integration with other features', () => {
  const id = 'testContainer';

  beforeEach(function() {
    this.$container = $(`<div id="${id}"></div>`).appendTo('body');
  });

  afterEach(function() {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('Integration with alter', () => {
    it('should allow inserting rows and columns with the formula plugin enabled', () => {
      const hot = handsontable({
        data: [['foo', null], ['=A1', null]],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
      });

      alter('insert_row_above', 0, 1);
      alter('insert_row_above', 2, 1);
      alter('insert_row_above', hot.countRows(), 1);

      expect(hot.countRows()).toEqual(5);

      alter('insert_col_start', 0, 1);
      alter('insert_col_start', 2, 1);
      alter('insert_col_start', hot.countCols(), 1);

      expect(hot.countCols()).toEqual(5);
    });
  });

  describe('Integration with Copy/Paste', () => {
    it('should allow pasting data near the table borders (thus extending the table)', () => {
      const hot = handsontable({
        data: [[1, 'x'], ['=A1 + 1', 'y']],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
      });

      const copyEvent = getClipboardEvent();
      const copyPastePlugin = getPlugin('CopyPaste');

      selectCell(0, 0, 1, 1);

      copyPastePlugin.onCopy(copyEvent);

      selectCell(1, 1);

      copyPastePlugin.onPaste(copyEvent);

      expect(hot.countRows()).toEqual(3);
      expect(hot.countCols()).toEqual(3);
      expect(hot.getData()).toEqual([
        [1, 'x', null],
        [2, '1', 'x'],
        [null, '2', 'y']
      ]);
    });
  });

  describe('Integration with minSpareRows/minSpareCols', () => {
    it('should display the minSpareRows and minSpareCols properly', () => {
      const hot = handsontable({
        data: [[1, 'x'], ['=A1 + 1', 'y']],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
        minSpareRows: 3,
        minSpareCols: 3,
      });

      expect(hot.countRows()).toEqual(5);
      expect(hot.countCols()).toEqual(5);
      expect(hot.getData()).toEqual([
        [1, 'x', null, null, null],
        [2, 'y', null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
      ]);
    });
  });

  describe('Integration with Autofill', () => {
    it('should allow dragging the fill handle outside of the table, adding new rows and performing autofill', async() => {
      const hot = handsontable({
        data: [
          ['test', 2, '=UPPER($A$1)', 4, 5, 6],
          [1, 2, 3, 4, 5, 6],
          [1, 2, 3, 4, 5, 6],
          [1, 2, 3, 4, 5, 6]
        ],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
        fillHandle: true
      });

      selectCell(0, 2);

      spec().$container.find('.wtBorder.current.corner').simulate('mousedown');
      spec().$container.find('tr:last-child td:eq(2)').simulate('mouseover');

      expect(hot.countRows()).toBe(4);

      await sleep(300);
      expect(hot.countRows()).toBe(5);

      spec().$container.find('tr:last-child td:eq(2)').simulate('mouseover');

      await sleep(300);
      expect(hot.countRows()).toBe(6);

      spec().$container.find('tr:last-child td:eq(2)').simulate('mouseup');

      await sleep(300);

      expect(hot.getData()).toEqual([
        ['test', 2, 'TEST', 4, 5, 6],
        [1, 2, 'TEST', 4, 5, 6],
        [1, 2, 'TEST', 4, 5, 6],
        [1, 2, 'TEST', 4, 5, 6],
        [null, null, 'TEST', null, null, null],
        [null, null, null, null, null, null]
      ]);

      expect(hot.getSourceData()).toEqual([
        ['test', 2, '=UPPER($A$1)', 4, 5, 6],
        [1, 2, '=UPPER($A$1)', 4, 5, 6],
        [1, 2, '=UPPER($A$1)', 4, 5, 6],
        [1, 2, '=UPPER($A$1)', 4, 5, 6],
        [null, null, '=UPPER($A$1)', null, null, null],
        [null, null, null, null, null, null]
      ]);
    });

    it('should populate dates and formulas referencing to them properly', async() => {
      handsontable({
        data: [
          ['28/02/1900', '28/02/1900', '28/02/1900'],
          ['=A1', '=B1', '=C1'],
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
        columns: [{
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }, {
          type: 'date',
          dateFormat: 'DD/MM/YYYY'
        }, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }],
        fillHandle: true,
      });

      selectRows(0, 1);

      spec().$container.find('.wtBorder.current.corner').simulate('mousedown');
      spec().$container.find('tr:last-child td:eq(0)').simulate('mouseover');
      spec().$container.find('tr:last-child td:eq(2)').simulate('mouseup');

      const formulasPlugin = getPlugin('formulas');

      await sleep(300);

      expect(getData()).toEqual([
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        [null, null, null]
      ]);

      expect(getSourceData()).toEqual([
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['=A1', '=B1', '=C1'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['=A3', '=B3', '=C3'],
        ['28/02/1900', '28/02/1900', '28/02/1900'],
        ['=A5', '=B5', '=C5'],
        [null, null, null]
      ]);

      expect(formulasPlugin.engine.getSheetValues(0)).toEqual([
        ['28/02/1900', 60, '28/02/1900'],
        ['28/02/1900', 60, '28/02/1900'],
        ['28/02/1900', 60, '28/02/1900'],
        ['28/02/1900', 60, '28/02/1900'],
        ['28/02/1900', 60, '28/02/1900'],
        ['28/02/1900', 60, '28/02/1900'],
      ]);

      expect(formulasPlugin.engine.getSheetSerialized(0)).toEqual([
        ['\'28/02/1900', '28/02/1900', '\'28/02/1900'],
        ['=A1', '=B1', '=C1'],
        ['\'28/02/1900', '28/02/1900', '\'28/02/1900'],
        ['=A3', '=B3', '=C3'],
        ['\'28/02/1900', '28/02/1900', '\'28/02/1900'],
        ['=A5', '=B5', '=C5'],
      ]);

      expect(getCellMeta(2, 0).valid).toBe(false);
      expect(getCellMeta(2, 1).valid).toBe(true);
      expect(getCellMeta(2, 2).valid).toBe(false);

      expect(getCellMeta(3, 0).valid).toBe(false);
      expect(getCellMeta(3, 1).valid).toBe(true);
      expect(getCellMeta(3, 2).valid).toBe(false);

      expect(getCellMeta(4, 0).valid).toBe(false);
      expect(getCellMeta(4, 1).valid).toBe(true);
      expect(getCellMeta(4, 2).valid).toBe(false);

      expect(getCellMeta(5, 0).valid).toBe(false);
      expect(getCellMeta(5, 1).valid).toBe(true);
      expect(getCellMeta(5, 2).valid).toBe(false);
    });
  });

  describe('Integration with Nested Rows', () => {
    it('should allow adding and removing rows, while retaining the formulas functionality', () => {
      const hot = handsontable({
        data: [
          {
            col1: 'parent1',
            __children: [
              {
                col1: '=A1 & "-"',
                __children: [
                  {
                    col1: 'p1.c1.c1',
                  }, {
                    col1: 'p1.c1.c2',
                    __children: [
                      {
                        col1: '=UPPER(A1)',
                      }
                    ]
                  }
                ]
              }],
          }],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
        nestedRows: true,
        rowHeaders: true,
        colHeaders: true
      });

      expect(hot.getDataAtCell(1, 0)).toEqual('parent1-');
      expect(hot.getDataAtCell(4, 0)).toEqual('PARENT1');

      hot.alter('insert_row_above', 1, 1);
      hot.alter('insert_row_above', 3, 1);
      hot.alter('insert_row_above', 7, 1);

      expect(hot.getDataAtCell(2, 0)).toEqual('parent1-');
      expect(hot.getDataAtCell(6, 0)).toEqual('PARENT1');
    });

    it('should allow detaching row children, while retaining the formulas functionality', () => {
      const hot = handsontable({
        data: [
          {
            col1: 'parent1',
            __children: [
              {
                col1: '=A1 & "-"',
                __children: [
                  {
                    col1: 'p1.c1.c1',
                  }, {
                    col1: 'p1.c1.c2',
                    __children: [
                      {
                        col1: '=UPPER(A1)',
                      }
                    ]
                  },
                  {
                    col1: 'p1.c1.c3',
                  }
                ]
              }],
          },
          {
            col1: 'parent2',
          }],
        formulas: {
          engine: HyperFormula,
          sheetName: 'Sheet1'
        },
        nestedRows: true,
        rowHeaders: true,
        colHeaders: true
      });
      const nestedRowsPlugin = hot.getPlugin('nestedRows');
      const nestedRowsDataManager = nestedRowsPlugin.dataManager;

      let rowToBeDetached = nestedRowsDataManager.getDataObject(1);

      nestedRowsDataManager.detachFromParent(rowToBeDetached);

      expect(hot.getDataAtCell(2, 0)).toEqual('parent1-');
      expect(hot.getDataAtCell(5, 0)).toEqual('PARENT1');

      rowToBeDetached = nestedRowsDataManager.getDataObject(5);

      nestedRowsDataManager.detachFromParent(rowToBeDetached);

      expect(hot.getDataAtCell(6, 0)).toEqual('PARENT1');
    });
  });
});
