const btn = document.querySelector("#pywebview_btn");
const post_btn = document.querySelector('#pywebview_postBtn');
const canvas =document.querySelector('#js_canvas');
const ctx = canvas.getContext('2d');
const match_selector = document.querySelector("#match_selector");
let connectId = 10;
let token = 'token1';
let match_list = [];

// 画像読み込み
const sprite = {
    craftsman: new Image(),
    castle: new Image(),
    wall: new Image(),
  };
  sprite.craftsman.src = "/static/img/craftsman.png";
  sprite.castle.src = "/static/img/castle.png";
  sprite.wall.src = "/static/img/wall.jpg";
  
  // 競技フィールドのクラス
  class Field {
    #url;
    #match_id;
    #token;
    #canvas;
    #ctx;
    #cellSize;
    #board;
    #fstFlag;
    constructor(delay, url, match_id, token) {
      this.#url = url;
      this.#match_id = match_id;
      this.#token = token;
      this.#fstFlag = true;
    }
  
    init() {
      // キャンバス要素の初期設定
      this.#canvas = canvas;
      this.#canvas.width = 500;
      this.#canvas.height = 500;
      this.#ctx = ctx;
      this.#cellSize = this.#canvas.width / this.#board.width;
    }
  
    // 状態の取得と反映
    update(data) {
      if (this.#fstFlag) {
        this.#board = data.board;
  
        this.init();
        this.#fstFlag = false;
      }
      this.draw(this.process_field(this.#board));
    }
  
    process_field(board){
      let field = Array()
      for(let i = 0; i < board.height; i++){
        field.push(Array());
        for(let j = 0; j < board.width; j++){
          let structure = board.structures[i][j];
          let wall = board.walls[i][j];
          let territory = board.territories[i][j];
          let mason = board.masons[i][j];
          let region = {
            'structure': structure,
            'wall': wall,
            'territory': territory,
            'mason': mason
          };
          field[i].push(region);
        }
      }
      return field;
    }
  
    // フィールドの描画
    draw(field) {
      this.clear();
      this.#ctx.save();
      for(let y = 0; y < this.#board.height; y++){
        for(let x = 0; x < this.#board.width; x++){
          let r = field[y][x];
          // チーム属性
          if (r.territory != 0) {
            let colors = ["#ccc", "#fcc", "#cfc", "#ccf"];
            this.#ctx.save();
            this.#ctx.beginPath();
            this.#ctx.fillStyle = colors[r.territories];
            this.#ctx.rect(
              x * this.#cellSize + 1, y * this.#cellSize + 1,
              this.#cellSize - 2, this.#cellSize - 2
            );
            this.#ctx.fill();
            this.#ctx.restore();
          }
          // 属性 (中立、陣地、城壁)
          if (r.wall == 2) {
            this.#ctx.save();
            this.#ctx.drawImage(
              sprite.wall,
              x * this.#cellSize + 4, y * this.#cellSize + 4,
              this.#cellSize - 8, this.#cellSize - 8
            )
            this.#ctx.restore();
          }
          // 職人
          if (r.mason != 0) {
            this.#ctx.save();
            //this.#ctx.beginPath();
            this.#ctx.fillStyle = (r.mason > 0 ? "#a00" : "#0a0");
            this.#ctx.font = "bold 20pt sans-serif";
            this.#ctx.textAlign = "center";
            this.#ctx.textBaseline = "middle";
            this.#ctx.drawImage(
              sprite.craftsman,
              x * this.#cellSize + 1, y * this.#cellSize + 1,
              this.#cellSize - 2, this.#cellSize - 2
            )
            this.#ctx.fillText(
              r.mason,
              (x + 0.5) * this.#cellSize, (y + 0.5) * this.#cellSize
            );
            this.#ctx.restore();
          }
          // 池
          if (r.structure == 1) {
            this.#ctx.save();
            this.#ctx.beginPath();
            this.#ctx.fillStyle = "#aaf";
            this.#ctx.rect(
              x * this.#cellSize + 1, y * this.#cellSize + 1,
              this.#cellSize - 2, this.#cellSize - 2
            );
            this.#ctx.fill();
            this.#ctx.restore();
          }
          // 城
          if (r.structure == 2) {
            this.#ctx.save();
            this.#ctx.drawImage(
              sprite.castle,
              x * this.#cellSize + 1, y * this.#cellSize + 1,
              this.#cellSize - 2, this.#cellSize - 2
            )
            this.#ctx.restore();
          }
        }
      }
      this.#ctx.restore();
      this.drawBorders();
    }
  
    // フィールドの表示初期化
    clear() {
      this.#ctx.save();
      this.#ctx.fillStyle = "#fff";
      this.#ctx.rect(0, 0, this.#canvas.width, this.#canvas.height);
      this.#ctx.fill();
      this.#ctx.restore();
    }
  
    // フィールドの枠線の描画
    drawBorders() {
      this.#ctx.save();
      this.#ctx.strokeStyle = "#000";
      this.#ctx.lineWidth = 1;
      for (let i = 0; i <= this.#board.width; i++) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(0, this.#cellSize * i);
        this.#ctx.lineTo(this.#canvas.width, this.#cellSize * i);
        this.#ctx.stroke();
        this.#ctx.beginPath();
        this.#ctx.moveTo(this.#cellSize * i, 0);
        this.#ctx.lineTo(this.#cellSize * i, this.#canvas.height);
        this.#ctx.stroke();
      }
      this.#ctx.restore();
    }
  }
  

function drawGrid(rows, cols) {
    for(let row = 0; row < rows; row++){
        for(let col = 0; col < cols; col++){
            const x = col * colSize;
            const y = row * rowSize;

            ctx.strokeRect(x, y, colSize, rowSize);
        }
    }
}

function get_map_data(response) {
    let res_json = response;
    //let map_size = res_json["Settings"]["size"];
    let field = new Field(3000, URL, connectId, token);
    let result = JSON.parse(res_json);
    field.update(result);
    let cols = result.board.height;
    let rows = result.board.width;
    rowSize = canvas.height/cols;
    colSize = canvas.width/rows;
    //drawGrid(map_size, map_size);

}

document.querySelector("#get_match_list_button").addEventListener("click", function(){
  token = document.querySelector("#token_input").value;
  $.ajax({
    type: 'get',
    url: '/matches',
    data:{
      'procon-token': token
    }
  }).done((data, status, xhr) => {
    data = JSON.parse(data);
    console.log(JSON.stringify(data));
    let selectHTML = "";
    for(let i = 0; i < data.matches.length; i++){
      match_list.push({
          'id': data.matches[i].id,
          'turns': data.matches[i].turns,
          'turnSec': data.matches[i].turnSeconds,
          'mason': data.matches[i].board.mason,
          'opponent': data.matches[i].opponent
      });
      selectHTML += `<option value="${match_list[i].id}">id: ${match_list[i].id}, 相手チーム: ${match_list[i].opponent}</option>`;
    }
    match_selector.innerHTML = selectHTML;
  }).fail((err) => {
    alert(err);
  });
});

document.querySelector("#get_match_info_button").addEventListener("click", function(){
  connectId = +document.querySelector("#match_selector").value;
  $.ajax({
    type: 'get',
    url: '/match',
    data: {
      'procon-token': token,
      'match_id': connectId
    }
  }).done((data, status, xhr) => {
    get_map_data(data);
  }).fail((err) => {
    alert(err);
  });
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedRow = Math.floor(mouseY / rowSize);
    const clickedCol = Math.floor(mouseX / colSize);

    console.log(`cliked:${clickedRow},${clickedCol}`);
})
