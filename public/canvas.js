(function () {
    console.log('checking js is connected!');

    let signature = document.getElementById("signature");
    console.log('signature:', signature);

    function signOnCanvas() {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext('2d');

        let x;
        let y;
        let draw;

        canvas.onmousedown = function (e) {
            draw = true;
            x = e.offsetX;
            y = e.offsetY;
        };

        canvas.onmousemove = function (e) {
            if (draw) {
                ctx.moveTo(x, y);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                x = e.offsetX;
                y = e.offsetY;
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        };

        canvas.onmouseout = function () {
            draw = false;
        };

        canvas.onmouseup = function () {
            draw = false;
            signature.value = canvas.toDataURL();

        };

    }

    signOnCanvas();
})();