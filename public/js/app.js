const addingLoader = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

const showModal = (selector) => {
    $("label.error").hide();
    $(".error").removeClass("error");
    $(selector).modal();
}

const hideModal = (selector) => {
    $(selector).modal("hide");
} 

const showError = (msg) => {
    toastr.error(msg);
}

const showSuccess = (msg) => {
    toastr.success(msg);
}

const showLoader = (selector, content) => {
    $(selector).html(content);
    document.querySelector(selector).disabled = true;
}

const hideLoader = (selector, content) => {
    $(selector).html(content);
    document.querySelector(selector).disabled = false;
}
