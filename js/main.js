function initPage() {
  renderProjs();
}

function renderProjs() {
  var elPortfolioContainer = document.querySelector("#portfolio-container");

  var strHtmlPreviews = "";

  for (var i = 0; i < gProjs.length; i++) {
    var proj = gProjs[i];
    strHtmlPreviews += `
    <div class="col-md-4 col-sm-6 portfolio-item" onclick="renderModal('${
      proj.id
    }')">
    <a class="portfolio-link" data-toggle="modal" href="#portfolioModal">
      <div class="portfolio-hover">
        <div class="portfolio-hover-content">
          <i class="fa fa-plus fa-3x"></i>
        </div>
      </div>
      <img class="img-fluid" src=${proj.imgUrl} alt="">
    </a>
    <div class="portfolio-caption">
      <h4>${proj.name}</h4>
      <p class="text-muted">Entertainment</p>
    </div>
  </div>`;
  }

  elPortfolioContainer.innerHTML = strHtmlPreviews;
}
function findProjIdx(projId) {
  var projIdx = gProjs.findIndex(function(proj) {
    return proj.id === projId;
  });
  return projIdx;
}
function renderModal(projId) {
  var projIdx = findProjIdx(projId);
  var proj = gProjs[projIdx];
  var elModalsContainer = document.querySelector(".modal-body");

  var strHtmlModals = `<h2> ${proj.name}</h2>
        <p class="item-intro text-muted">Lorem ipsum dolor sit amet consectetur.</p>
        <img class="img-fluid d-block mx-auto" id="project_img" src=${
          proj.imgUrl
        } alt="">
        <p id="project_description">${proj.description}</p>
        <ul id="project_info" class="list-inline">
          <li>Date: ${proj.publishedAt}</li>
          <li>Category:<span> Entertainment</span></li>
          <li>Link to project: <a target="_blank" href=${proj.link}>${
    proj.name
  }</a> </li> </ul>
        <button class="btn btn-primary" data-dismiss="modal" type="button">
          <i class="fa fa-times"></i>
          Close Project</button>`;
  elModalsContainer.innerHTML = strHtmlModals;
}
