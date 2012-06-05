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

    // Read the file list
    var files = evt.dataTransfer.files;

    // Add the files to the decompile queue
    for (var i = 0, f; f = files[i]; i++){

        var reader = new FileReader();
        
        // When a file is read, decompile it and add to the interface.
        reader.onload = function(fname){
            return function(evt) {
                var deco = decompile(evt.target.result);
                if (deco !== false){

                    // Hide the drop zone and show the editor
                    $('#initial').transition({opacity: 0}).
                                        css({display: "none"});

                    $('#fileDropZone').transition({opacity: 0}).
                                        css({display: "none"});

                    $('#editor').css({display: "block"}).
                                 transition({opacity: 1});

                    handleNewSource(deco);
                }
                else{                
                    var errorZone = document.getElementById('errorMessage');
                    errorZone.innerHTML = 
                         'Sorry, "<em>' + fname + '</em>" couldn\'t be disassembled.';
                }
            }
        }(f.name);
        
        reader.readAsBinaryString(f);
    }
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

    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
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
    var dropZone = document.getElementById('fileDropZone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    
    return true;
}
