var api_key = "ythyuUi1QJL1SU0JXYeoVd8YvZe5y7NH0Cfc2NtP";
// var api_key = "DEMO_KEY";

function fillLabel(nutrition) {
  function helper(nutrients, number) {
    for (var i=0; i<nutrients.length; i++) {
      if (nutrients[i]["nutrient_id"] == number.toString()) {
        return nutrients[i]["measures"][0]["value"];
      }
    }
    return false;
  }
  function getServingSize(nutrients) {
    var amount = nutrients[0]["measures"][0]["qty"];
    var label = nutrients[0]["measures"][0]["label"];
    label = label.split(' ').slice(0,3).join(" ");
    return amount + label
  }
  function getIngredients(nutrition) {
    if ("ing" in nutrition.report.food) {
      return nutrition.report.food.ing.desc;
    } else {
      return "";
    }
  }
  function setNutritionPercentages(nutritionObject) {
    var dailyValue = {
      "total-fat": 65,
      "sat-fat": 20,
      "cholesterol": 300,
      "sodium": 2400,
      "total-carbs": 300,
      "fiber": 25,
      "vit-d": 400,
      "calcium": 1000,
      "iron": 18,
      "potassium": 3500,
    };
    for (var each in dailyValue) {
      nutritionObject[each+"-percent"] = Math.round((parseInt(nutritionObject[each]) / dailyValue[each])*100);
    }
    return nutritionObject;
  }

  var nutrients = nutrition.report.food.nutrients;
  var nutritionObject = {
    "serving-size": getServingSize(nutrients),
    "calories": helper(nutrients, 208) || "0",
    "total-fat": helper(nutrients, 203) || "0",
    "sat-fat": helper(nutrients, 606) || "0",
    "trans-fat": helper(nutrients, 605) || "0",
    "cholesterol": helper(nutrients, 601) || "0",
    "sodium": helper(nutrients, 307) || "0",
    "total-carbs": helper(nutrients, 205) || "0",
    "fiber": helper(nutrients, 291) || "0",
    "sugar": helper(nutrients, 269) || "0",
    "protein": helper(nutrients, 203) || "0",
    "vit-d": helper(nutrients, 181) || "0",
    "calcium": helper(nutrients, 301) || "0",
    "iron": helper(nutrients, 303) || "0",
    "potassium": helper(nutrients, 306) || "0",
    "ingredients": getIngredients(nutrition)
  };
  nutritionObject = setNutritionPercentages(nutritionObject);
  for (var each in nutritionObject) {
    document.getElementById(each).textContent = nutritionObject[each];
  }
}

document.addEventListener("DOMContentLoaded", bindSearchButton);

function bindSearchButton(){
  document.getElementById("search-submit").addEventListener("click", function(event){
    event.preventDefault();
    var req = new XMLHttpRequest;
    var url = "https://api.nal.usda.gov/ndb/search?api_key=";

    var payload = {
      "q": document.getElementById("search-keyword").value,
      "max": "5",
      // "sort": "n"      // sort by name
    };

    req.open("POST", url + api_key, true);
    req.setRequestHeader("Content-Type", "application/json")
    req.send(JSON.stringify(payload));

    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        var resultsList = document.getElementById("search-results");

        // Remove old children
        while (resultsList.hasChildNodes()) {
          resultsList.removeChild(resultsList.lastChild);
        }

        var button = document.createElement("input");
        button.setAttribute("type", "submit");
        button.setAttribute("value", "Fill Label!");
        button.id = "label-submit";
        button.addEventListener("click", function(event) {
          event.preventDefault();
          fillLabelButtion();
        });

        for (var i=0; i<response.list.item.length; i++) {
          var div = document.createElement("div");
          var radio = document.createElement("input");
          radio.id = "g1b" + (i+1);
          radio.setAttribute("type", "radio");
          radio.classList = "ndbno-radios";
          radio.setAttribute("name", "group1");
          radio.setAttribute("ndbno", response.list.item[i].ndbno);
          var label = document.createElement("label");
          label.setAttribute("for", "g1b" + (i+1));
          label.textContent = response.list.item[i].name;
          div.appendChild(radio);
          div.appendChild(label)
          resultsList.appendChild(div);

        }
        resultsList.appendChild(button);
      }
    });
  });
}

function getNutritionInfo(ndbno) {
  var req = new XMLHttpRequest;
  var url = "https://api.nal.usda.gov/ndb/reports/V2?api_key=";

  var payload = {
    "ndbno": ndbno,
    "type": "f"
  };

  req.open("POST", url + api_key, true);
  req.setRequestHeader("Content-Type", "application/json")
  req.send(JSON.stringify(payload));

  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      var parsedJSON = JSON.parse(req.responseText);
      fillLabel(parsedJSON);
    }
  });
}

function fillLabelButtion() {
  var resultsList = document.getElementsByClassName("ndbno-radios");
  for (var i=0; i<resultsList.length; i++) {
    if (resultsList[i].checked) {
      getNutritionInfo(resultsList[i].getAttribute("ndbno"));
      return;
    }
  }
}
