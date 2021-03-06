var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {

    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// clicking on the p elemet of the task
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim();

  // replace p element with textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");

});
// clicking outside of text area 
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  // replace textare with p element
  $(this).replaceWith(taskP);
})


// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out element
  $(this).replaceWith(dateInput);

  // enable jqueryui datepicker
  dateInput.datepicker({
    minDate:1
  })

  // automatically focus on new Element
  dateInput.trigger("focus");
});

// value of due date was change
$(".list-group").on("change", "input[type='text']", function () {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get parent's ul id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li eklements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-sae to local storage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badbe-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // pass task's li element into adutitask() to check new due date
  auditTask($(taskSpan)).closest("list-group-item")
})

// sortable feature
$(".card .list-group").sortable({
  // connectWith links all .list-group classes to allow movement between
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    // console.log("activate", this);
  },
  deactivate: function (event) {
    // console.log("over", event.target);
  },
  over: function (event) {
    // console.log("over", event.target);
  },
  out: function (event) {
    // console.log("out", event.target);
  },
  

  update: function (event) {
    // array to store temp data in
  var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
    
      var date = $(this)
        .find("span")
        .text()
        .trim();
    
      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    })
  // trim down list's iD to match the object property
  var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // updat array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
});

// trash function
$("#trash").droppable({
  accept:".card .list-group-item",
  tolerance: "touch",
  over: function(event, ui){
    // remove dragged element from the dom
    ui.draggable.remove();
  }
});

$("#modalDueDate").datepicker({
  minDate:1,
  // when calendar is closed, force a "change" event on the `dateInput`
  onClose: function(){
  $(this).trigger("change")
}
});

var auditTask = function(taskEl) {
  // get date from taask element
  var date = $(taskEl).find("span").text().trim();

  // convert into monet object 
  var time = moment(date, "L").set("hour", 17);
 
  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over
  if(moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger")
  }
  else if(Math.abs(moment().diff(time, "days")) <=2){
    $(taskEl).addClass("list-group-item-warning");
  }
};





// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();



  }
  saveTasks();
});

// load tasks for the first time
loadTasks();