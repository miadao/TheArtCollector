const BASE_URL = 'https://api.harvardartmuseums.org';
const KEY = 'apikey=07f85fe2-e6a1-46b1-9595-1263fca7dff3'; 


async function fetchObjects() {
    const url = `${ BASE_URL }/object?${ KEY }`;
     onFetchStart();

    try {
      const response = await fetch(url);
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error(error);
    }finally {
      onFetchEnd();
    }
  }
fetchObjects().then(x => console.log(x));



async function fetchAllCenturies() {
  const URL = `${ BASE_URL }/century?${ KEY }&size=100&sort=temporalorder`;

    if (localStorage.getItem('centuries')) {
    return JSON.parse(localStorage.getItem('centuries'));
      }
  
      onFetchStart();
  try {
    const response = await fetch(URL);
    const data = await response.json();
    const records = data.records;

    return records;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}



async function fetchAllClassifications() {
  const URL = `${ BASE_URL }/classification?${ KEY }&size=100&sort=name`;
  
    if (localStorage.getItem('classifications')) {
    return JSON.parse(localStorage.getItem('classifications'));
      }
    onFetchStart();
  try {
    const response = await fetch(URL);
    const data = await response.json();
    const records = data.records;

    return records;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}



async function prefetchCategoryLists() {
    try {
      const [classifications, centuries] = await Promise.all([
        fetchAllClassifications(),
        fetchAllCenturies()
      ]);
      
    $('.classification-count').text(`(${ classifications.length })`);
    classifications.forEach(classification => {
        $('#select-classification')
        .append($(`<option value="${ classification.name }">${ classification.name }</option>`));
    });
  
    
    $('.century-count').text(`(${ centuries.length }))`);
    centuries.forEach(century => {
        $('#select-century')
        .append($(`<option value="${ century.name }">${ century.name }</option>`));
    });

      } catch (error) {
          console.error(error);
      }
  }

  




function buildSearchString() {
  const classification = $('#select-classification').val();
  const century = $('#select-century').val();
  const keyword = $('#keywords').val();

    const URL = `${ BASE_URL }/object?${ KEY }&classification=${classification}&century=${century}&keyword=${keyword}`;
    const encodedUrl = encodeURI(URL);

    return encodedUrl;
}
   


$('#search').on('submit', async function (event) {
   
    onFetchStart();
    event.preventDefault();

  try {
      const URL = buildSearchString();
      const response = await fetch(URL);
      const data = await response.json();
     
      // const record = data.records;
      const {info, records} = data;
      updatePreview({records, info});
      // console.log(data);
      // console.log(record);

    } catch (error) {
      console.error(error);
  } finally {
    
    onFetchEnd();
  }
  
})

       

function onFetchStart() {
    $('#loading').addClass('active');
  }
  
  function onFetchEnd() {
    $('#loading').removeClass('active');
  }


async function someFetchFunction() {
    onFetchStart();
  
    try {
      await fetch();
    } catch (error) {
      console.error(error);
    } finally {
      onFetchEnd();
    }
  }

  //End of Module 1




function renderPreview(record) {
    // grab description, primaryimageurl, and title from the record
  const template = `
  <div class="object-preview">
  <a href="#">
   <img src = ${ record.primaryimageurl ?  record.primaryimageurl : 'https://placekitten.com/100/100' }/> 
    <h3>${ record.title }</h3>
    <h3> ${ record.description }</h3>
  </a>
</div>

  `
  return $(template);
  }

  
  
function updatePreview(records) {
  // console.log(records);
  // console.log(info);
  const root = $('#preview');
  
  if (records.info.next) {
      $('.next').data('url', records.info.next)
      $('.next').attr('disabled', false);

  } else {
   
    $('.next').data('url', null)
    $('.next').attr('disabled', true);
  }
  
  if (records.info.prev) {
   
    $('.previous').data('url', records.info.prev)
    $('.previous').attr('disabled', false);

  } else {
    $('.previous').data('url', null)
    $('.previous').attr('disabled', true);
  }

  const element = root.find('.results');
  element.empty();
  records.records.forEach(record => element.append(renderPreview(record))); 

}


$('#preview .next, #preview .previous').on('click', async function () {
  
  onFetchStart();
    try{

      const url = $(this).data('url')
      const response = await fetch(url);
      const {records, info} = await response.json();
      updatePreview(records, info);
  }catch (error){
    console.error(error);
  } finally{
    onFetchEnd();
  }

});

//End of Module2


function renderFeature(record) {
  
  const template = 
  `<div class="object-feature">

  <header>
  <h3>${ factHTML("title", record.title, 'title') }</h3>
  <h4>${ factHTML("dated", record.dated, 'dated') }</h4>
  </header>

 
  <section class = "facts">
    <p> ${ factHTML("description", record.description, 'description') } </p>
    <p> ${ factHTML("culture", record.culture, 'culture') } </p>
    <p> ${ factHTML("technique", record.technique, 'technique') } </p>
    <p> ${ factHTML("medium", record.medium ? medium.toLowerCase() : null, 'medium') } </p>
    <p> ${ factHTML("dimensions", record.dimensions, 'dimensions') } </p>
    <p> ${ factHTML("people", record.people ? people.map(person=> factHTML('Person', person.displayname, 'person').join('')) : '', 'people') } </p>
    <p> ${ factHTML("department", record.department, 'department') } </p>
    <p> ${ factHTML("division", record.division, 'division')} </p>
    <p>  ${ factHTML('Contact', `<a target="_blank" href="mailto:${ record.contact }">${ record.contact }</a>`) } </p>
    <p> ${ factHTML("creditLine", record.creditline, 'creditLine') } </p>
    <p> ${ factHTML("style", record.style, 'style') } </p>
  </section>

  <section class ="photos">
    <p> ${ photosHTML("images", record.images, 'images') } </p>
    <p> ${ photosHTML("primaryimageurl", record.primaryimageurl, 'primaryimageurl') } </p>
  </section>

  </div>`
  return $(template).data(record);
}


$('#preview').on('click', '.object-preview', function (event) {
  event.preventDefault(); // they're anchor tags, so don't follow the link
  const record = $(this).data('record');
  
  const featureElement = $('#feature');
  featureElement.html( renderFeature(record) );  
});



function searchURL(searchType, searchString) {
  return `${ BASE_URL }/object?${ KEY }&${ searchType}=${ searchString }`;
}

function factHTML(title, content, searchTerm = null) {
  // if content is empty or undefined, return an empty string ''
  if(!content){
    return '';
  }

  return `
  <section class = "title"> ${ title }</section>
  <section class = "content"> ${ content }</section>
  <section class = "searchTerm"> ${ searchTerm ? searchTerm : ''} </section>
  `
  
}

function photosHTML(images, primaryimageurl) {
  // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src
  if(images.length >0){
    return images.map(image => `<img src=${ image.baseimageurl }/>`).join('');
  } else if (primaryimageurl) {
    return `<img src =${ primaryimageurl }/>`
  } else {
    return '';
  }
  // else if primaryimageurl is defined, return a single image tag with that as value for src

  // else we have nothing, so return the empty string
}


$('#feature').on('click', 'a', async function (event) {
  // read href off of $(this) with the .attr() method
  const href = $(this).attr('href')
  if(href.startsWith('mailto:')){
    return;
  }

event.preventDefault();
onFetchStart();
try{
  let result = await fetch(href);
  let {records, info} = await result.json();
  updatePreview(records, info);
} catch (error){
  console.error(error)
}finally{
  onFetchEnd();
}
  // prevent default

  // call onFetchStart
  // fetch the href
  // render it into the preview
  // call onFetchEnd
});
prefetchCategoryLists();