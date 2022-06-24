var canvas  = $("#canvas"),
    context = canvas.get(0).getContext("2d"),
    result = $('#result');

var croppedImageDataURL = '';

$('.file-input').on( 'change', function(){
  let fileInput = $(this);
    if (this.files && this.files[0]) {
      if ( this.files[0].type.match(/^image\//) ) {

        var reader = new FileReader();
        reader.onload = function(evt) {

           var img = new Image();
           img.onload = function() {
            
            context.canvas.height = img.height;
            context.canvas.width  = img.width;
            context.drawImage(img, 0, 0);
            let cropperOptions = {}
             if(fileInput.data('ratio'))
             {
               let ratio = fileInput.data('ratio').split(':')
                cropperOptions = { 
                aspectRatio: ratio[0] / ratio[1],
                strict: true,
                // cropBoxMovable: true,
                // cropBoxResizable: false,
              }
             }

             if (fileInput.data('dimensions')) 
             {
              let dimensions = fileInput.data('dimensions').split(':')
              let dWidth = parseInt(dimensions[0].replace('w',''))
              let dHeight = parseInt(dimensions[1].replace('h',''))
              cropperOptions = { data:{ 
                width: dWidth,
                height: dHeight,
                cropBoxMovable: true,
                cropBoxResizable: false,
            }}

             }
            

            

             var cropper = canvas.cropper(cropperOptions);

            //  cropper.on('cropmove',function(){
            //   $(this).getData();
            //  });

             executeViewForStage('PROCESS')

             $('#btnCrop').click(function() {

                croppedImageDataURL = canvas.cropper('getCroppedCanvas').toDataURL("image/png"); 
                
                result.html( $('<img>').attr('src', croppedImageDataURL) );
                
                executeViewForStage('VIEW')

             });



             $('#btnRestore').click(function() {
               canvas.cropper(cropperOptions);
               result.empty();
               executeViewForStage('PROCESS')
             });

             $('#btnDone').click(function() {
               
                let fileName = 'Cropped_'+fileInput.val().split('\\').pop();
                
                var block = croppedImageDataURL.split(";");
                
                var contentType = block[0].split(":")[1];
               
                var realData = block[1].split(",")[1];

                let file = new File([base64toBlob(realData,contentType)], fileName ,{type:contentType, lastModified:new Date().getTime()});
        
                let container = new DataTransfer();

                container.items.add(file);
                
                fileInput.prop('files',container.files)

                // saveImage(container.files[0]);

                canvas.cropper("destroy")

                result.empty();

                executeViewForStage('FINISH')

              });


           };
           img.src = evt.target.result;
		};
        reader.readAsDataURL(this.files[0]);
      }
      else {
        alert("Invalid file type! Please select an image file.");
      }
    }
    else {
      alert('No file(s) selected.');
    }
});


function executeViewForStage(stage)
{

    if(stage == 'PROCESS')
    {
        $('#input-module').hide()
        $('#canvas-module').show()
        $('#result-module').hide()
    }

    if(stage == 'VIEW')
    {
        $('#input-module').hide()
        $('#canvas-module').hide()
        $('#result-module').show()
    }

    if(stage == 'FINISH')
    {
        $('#input-module').show()
        $('#canvas-module').hide()
        $('#result-module').hide()
    }
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}



// function saveImage(file)
// {    
// 	let formData = new FormData();
// 	formData.append('file',file)
// 	$.ajax({ 
// 		type: "POST", 
// 		url: 'http://localhost/frameover/server/store.php',
// 		cache: false,
//     	contentType: false,
//     	processData: false,
// 		data: formData
// 	}).then((response) => {
// 		console.log(response);
// 	});
// }  
  