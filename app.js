var budgetController = (function () {
  var Expenses = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expenses.prototype.calculatePercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expenses.prototype.getPercentage = function () {
    return this.percentage;
  };

  var data = {
    Allitems: {
      inc: [],
      exp: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  function calculateTotal(type) {
    var sum = 0;
    data.Allitems[type].forEach(function (curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  }

  return {
    Testing: function () {
      console.log(data);
    },
    additem: function (type, des, val) {
      var newItem, ID;
      if (data.Allitems[type].length > 0) {
        ID = data.Allitems[type][data.Allitems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expenses(ID, des, val);
      }
      data.Allitems[type].push(newItem);
      return newItem;
    },
    deleteitem: function (type, id) {
      var index, ids;

      ids = data.Allitems[type].map(function (curr) {
        return curr.id;
      });

      index = ids.indexOf(id);

      data.Allitems[type].splice(index, 1);
    },
    calculatePercentages: function () {
      data.Allitems.exp.forEach(function (curr) {
        curr.calculatePercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var Percentages;
      Percentages = data.Allitems.exp.map(function (curr) {
        return curr.getPercentage();
      });
      return Percentages;
    },
    calculateBudget: function () {
      calculateTotal("inc");
      calculateTotal("exp");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === "inc" ? "+" : "-") + " " + int + "." + dec;
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListitem: function (type, obj) {
      var html, newhtml, element;
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-trash-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-trash-outline"></i></button></div></div></div>';
      }
      newhtml = html.replace("%id%", obj.id);
      newhtml = newhtml.replace("%description%", obj.description);
      newhtml = newhtml.replace("%value%", formatNumber(obj.value, type));
      document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);
    },
    deleteListitem: function (Id) {
      var el = document.getElementById(Id);
      el.parentNode.removeChild(el);
    },
    getDOMstrings: function () {
      return DOMstrings;
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (curr) {
        curr.value = "";
      });
      fieldsArr[0].focus();
    },
    displayPercentages(Perc) {
      var ellist, elementarray;
      ellist = document.querySelectorAll(DOMstrings.expensesPercLabel);
      elementarray = Array.prototype.slice.call(ellist);
      elementarray.forEach(function (curr, index) {
        if (Perc[index] > 0) {
          curr.textContent = Perc[index] + "%";
        } else {
          curr.textContent = "---";
        }
      });
    },
    displayBudget: function (obj) {
      var type;
      obj.budget >= 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayMonth: function () {
      var now, months, fullyear, month;
      now = new Date();
      month = now.getMonth();
      fullyear = now.getFullYear();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + fullyear;
    },
    changedType: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputValue +
          "," +
          DOMstrings.inputDescription
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (curr) {
        curr.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
  };
})();

var Controller = (function (UICtrl, budgetCtrl) {
  var DOMs = UICtrl.getDOMstrings();

  var setupEventListeners = function () {
    document
      .querySelector(DOMs.inputBtn)
      .addEventListener("click", ctrlAdditem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13) {
        ctrlAdditem();
      }
    });

    document
      .querySelector(DOMs.container)
      .addEventListener("click", ctrlDeleteitem);

    document
      .querySelector(DOMs.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    budgetCtrl.calculateBudget();
    budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    var Percentages;
    budgetCtrl.calculatePercentages();
    Percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(Percentages);
  };

  var ctrlDeleteitem = function (e) {
    var itemID, SplitID, type, Id;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if (itemID) {
      SplitID = itemID.split("-");
      type = SplitID[0];
      Id = parseInt(SplitID[1]);
      budgetCtrl.deleteitem(type, Id);
      UIController.deleteListitem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  var ctrlAdditem = function () {
    var input, Item;
    var input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      UICtrl.clearFields();
      Item = budgetCtrl.additem(input.type, input.description, input.value);
      UICtrl.addListitem(input.type, Item);
      updateBudget();
      updatePercentages();
    }
  };

  return {
    init: function () {
      setupEventListeners();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalExp: 0,
        totalInc: 0,
        percentage: -1,
      });
      console.log("Application has started succesfully.");
    },
  };
})(UIController, budgetController);

Controller.init();
