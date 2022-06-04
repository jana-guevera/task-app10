const getTasks = async (searchText) => {
    var url = "/api/tasks";

    if(searchText && searchText !== ""){
        url = "/api/tasks?search=" + searchText; 
    }

    try{
        const response = await fetch(url);
        const tasks = await response.json();

        var tasksHtml = "";

        tasks.forEach((task) => {
            tasksHtml = tasksHtml + taskComponent(task);
        });

        $(".task-container").html(tasksHtml);
    }catch(e){
        showError("Something went wrong. Unable to fetch tasks!");
    }
}

const createTask = async () => {
    const url = "/api/tasks";

    hideModal("#create-modal");
    $("#create-btn").html();

    showLoader("#create-btn", addingLoader);

    const data = {
        description: $("#description").val(),
        completed: document.querySelector("#completed").checked
    }

    try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const task = await response.json();

        hideLoader("#create-btn", "Add +");

        if(task.error){
            return showError(task.error);
        }

        const taskHtml = taskComponent(task);

        const taskContainer = document.querySelector(".task-container");
        taskContainer.innerHTML = taskContainer.innerHTML + taskHtml;

        showSuccess("Task created successfully!");
    }catch(e){
        console.log(e);
        showError("Something went wrong. Unable to create task!");
    }
}

const initiateUpdate = async (id) => {
    const url = "/api/tasks/" + id;

    try{
        const response = await fetch(url);
        const task = await response.json();

        if(task.error){
            return alert(task.error);
        }

        $("#updateDesc").val(task.description);
        document.querySelector("#updateCompleted").checked = task.completed;
        document.querySelector("#task-id").value = task._id;

        showModal("#update-modal");
    }catch(e){
        showError("Something went wrong. Unable to fetch the task!");
    }
    
}

const updateTask = async () => {
    const taskId =  document.querySelector("#task-id").value; 
    const url = "/api/tasks/" + taskId;

    hideModal("#update-modal");
    showLoader("#task-" + taskId + " .btn-primary", generalLoader);

    const data = {
        description: $("#updateDesc").val(),
        completed: document.querySelector("#updateCompleted").checked
    }

    try{
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const task = await response.json();

        hideLoader("#task-" + taskId + " .btn-primary", `<i class="fas fa-edit"></i>`);

        if(task.error){
            return alert(task.error);
        }

        $("#task-" + taskId + " h4").text(task.description);

        showSuccess("Task updated successfully!");
    }catch(e){
        showError("Something went wrong. Unable to update task!");
    }
}

const initiateDelete = (id) => {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if(willDelete){
            deleteTask(id);
        }
    })
}

const deleteTask = async (id) => {
    const url = "/api/tasks/" + id;

    showLoader("#task-" + id + " .btn-danger", generalLoader);

    try{
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const task = await response.json();

        hideLoader("#task-" + id + " .btn-danger", `<i class="fas fa-trash"></i>`);

        if(task.error){
            return showError(task.error);
        }

        document.querySelector("#task-" + id).remove();

        showSuccess("Task deleted successfully!");
    }catch(e){
        showError("Something went wrong. Unable to delete task!");
    }
}

const taskComponent = (task) => {
    return `
        <div class="task-card" id="task-${task._id}">
            <h4>${task.description}</h4>

            <div class="task-actions">
                <button class="btn btn-primary btn-sm" onclick="initiateUpdate('${task._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="initiateDelete('${task._id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}

getTasks();

const createForm = $("#create-form");
const updateForm = $("#update-form");
const searchForm = $("#search-form");

createForm.validate({
    rules:{
        desc: {
            required: true
        }
    }
});

updateForm.validate({
    rules:{
        updateDesc: {
            required: true
        }
    }
});

createForm.on("submit", (e) => {
    e.preventDefault();

    if(createForm.valid()){
        createTask();
    }
});

updateForm.on("submit", (e) => {
    e.preventDefault();

    if(updateForm.valid()){
        updateTask();
    }
});

searchForm.on("submit", (e) => {
    e.preventDefault();

    const searchText = $("#search-input").val();

    getTasks(searchText);
});