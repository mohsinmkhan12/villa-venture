document.addEventListener("DOMContentLoaded", function() {
    // Automatically remove flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function(message) {
        setTimeout(function() {
            message.remove();
        }, 5000);
    });
});

function removeFlashMessage(element) {
    element.closest('.flash-message').remove();
}