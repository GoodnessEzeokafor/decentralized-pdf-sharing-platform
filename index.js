const contractSource = `
contract File=
  record file ={
    id:int,
    name:string,
    description:string,
    createdAt:int,
    updatedAt:int,
    file_hash:string}
  record state ={
      index_counter:int,
      files:map(int,file)}
  entrypoint init()={
    index_counter=0,
    files={}}
  entrypoint getFileLength():int=
    state.index_counter
  stateful entrypoint add_file(_name:string,_description:string,_hash :string) =
   let stored_file = {id=getFileLength() + 1,name=_name,description=_description, createdAt=Chain.timestamp,updatedAt=Chain.timestamp,file_hash=_hash}
   let index = getFileLength() + 1
   put(state{files[index]=stored_file,index_counter=index})
  
  entrypoint get_file_by_index(index:int) : file = 
   switch(Map.lookup(index, state.files))
     None => abort("Product does not exist with this index")
     Some(x) => x  
     
`
const contractAddress ='ct_23BPKFtRJJvYRLhZDMZQt9sQVyQUBNpk2EoQKRoRe2wd5D6Cdg'

var client = null // client defuault null
var fileListArr = [] // empty arr
var fileListLength = 0 // empty product list lenghth


// asychronus read from the blockchain
async function callStatic(func, args) {
const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  return decodedGet;
}

//Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
  // client = await Ae.Aepp()
  // console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, value)
  // return client.contractCall(contractAddress, 'sophia-address', contractAddress, func, { args, value })

  // client = await Ae.Aepp();
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  console.log("Contract:", contract)
  //Make a call to write smart contract func, with aeon value input
  // const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));
  const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));
  console.log("CalledSet", calledSet)
  return calledSet;
}


// mustche

function renderFileList(){
  let template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {fileListArr});
  $("#getFile").html(rendered);
  console.log("Mustashe Template Display")
}


document.addEventListener('DOMContentLoaded', async () => {
    // const node = await Ipfs.create({ repo: 'ipfs-' + Math.random() })
  const node = await IpfsHttpClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      // headers: {
      //   authorization: 'Bearer ' + TOKEN
      // }
  })
  console.log(node)
    window.node = node
    // const status = node.isOnline() ? 'online' : 'offline'
    // console.log(`Node status: ${status}`)
    // document.getElementById('status').innerHTML = `Node status: ${status}`
    // You can write more code here to use it. Use methods like
    // node.add, node.get. See the API docs here:
    // https://github.com/ipfs/interface-ipfs-core
  })
var buffer = null
// async function addFile(){
//     var file = document.getElementById('file')
//     console.log(file.val())
// }
window.addEventListener('load', async()=>{
  client = await Ae.Aepp();
  
})
$('#addFile').click(async function(event){
  var name = ($("#name").val())
  var description =($("#description").val())
  var new_file = document.getElementById("fileInput")
  // console.log(new_file.files[0])
  var file = new_file.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () =>{
    var buffer =Buffer(reader.result)
      // var fileAdded = await node.add(buffer)
      console.log(buffer)
      
    var fileAdded = node.add(buffer, (error, result) => {
      console.log("Result:", result)
      if(error){
        console.error("error", error)
        return;
      }
      result.forEach(async (file) => {
          console.log("successfully stored", file.hash)
          const new_file = await contractCall('add_file', [name, description, file.hash],0);
          console.log(new_file)
      });
    })
  
  }
    
  
  event.preventDefault();
})


 
// <script src="https://unpkg.com/ipfs-http-client@9.0.0/dist/index.js"
// integrity="sha384-5bXRcW9kyxxnSMbOoHzraqa7Z0PQWIao+cgeg327zit1hz5LZCEbIMx/LWKPReuB"
// crossorigin="anonymous"></script>
/* <script src="https://unpkg.com/ipfs-http-client/dist/index.min.js"></script> */
// const ipfs = ipfsClient('localhost', '5001')
