/**
 * @file input.js
 * @brief Manages file addition.
 *
 */

/**
 * Description: Handles the file selection event.
 *
 * @param evt Drop event.
 *
 */
function handleFileSelect(evt) {
    // Catch the event
    evt.stopPropagation();
    evt.preventDefault();

    //~ $('#fileDropZone').transition({ y: '200px'}).
                       //~ transition({ x: '200px'}).
                       //~ transition({ y: '100px'}));

    var dt = evt.dataTransfer;

    var genDisassemblerTrigger = (function(fname){
        return function(evt) {
            var deco = decompile(evt.target.result);
            if (deco !== false){

                // Hide the drop zone and show the editor
                $('.frameContainer').transition({opacity: 0}).
                    css({display: "none"});

                $('#editor').css({display: "block"}).
                    transition({opacity: 1});

                handleNewSource([deco]);
            }
            else{
                var errorZone = document.getElementById('errorMessage');
                errorZone.innerHTML =
                    'Sorry, "<em>' + fname + '</em>" couldn\'t be disassembled.';
            }
        };
    });

    // Read the file list
    var files = evt.dataTransfer.files;

    // Add the files to the decompile queue
    for (var i = 0; i < files.length; i++){
        var f = files[i];

        var reader = new FileReader();

        // When a file is read, decompile it and add to the interface.
        reader.onload = genDisassemblerTrigger(f.name);

        reader.readAsBinaryString(f);
    }
    return false;
}


/**
 * Description: Handle the drag over event.
 *  Declare the intention to copy the file.
 *
 * @param evt The drag over event.
 *
 */
function handleDragOver(evt) {
    // Catch the event
    evt.stopPropagation();
    evt.preventDefault();

    // evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    return false;
}


/**
 * Description: Handle the drag enter event.
 *  Declare the intention to copy the file.
 *
 * @param evt The drag enter event.
 *
 */
function handleDragEnter(evt) {
    // Catch the event
    evt.stopPropagation();
    evt.preventDefault();

    // evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    return false;
}


/**
 * Description: Initialize the Drag and drop listeners.
 *
 */
function initialize(){

    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList)){
        var errorZone = document.getElementById('errorMessage');
        errorZone.innerHTML =
             'Sorry, the File APIs are not fully supported in this browser :(.';
    }

    // Setup the Drag and Drop listeners.
    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('drop', handleFileSelect, true);

    return true;
}
