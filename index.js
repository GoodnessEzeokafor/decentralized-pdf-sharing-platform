contractSource = `
contract File=
  record file ={
    id:int,
    name:string,
    description:string,
    createdAt:int,
    updatedAt:int,
    hash:string}
  record state ={
      index_counter:int,
      files:map(int,file)}
  entrypoint init()={
    index_counter=0,
    files={}}
  entrypoint getFileLength():int=
    state.index_counter
  stateful entrypoint add_file(_name:string,_description:string,_hash :string) =
   let stored_file = {id=getFileLength() + 1,name=_name,description=_description, createdAt=Chain.timestamp,updatedAt=Chain.timestamp,hash=_hash}
   let index = getFileLength() + 1
   put(state{files[index]=stored_file,index_counter=index})

`
contractAddress ='ct_A17iNgVV1gYP3rmmeKVKk8LmWjmkNiRHrkN1UddDaaRfpsMyy'

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
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  console.log("Contract:", contract)
  const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));
  console.log("CalledSet", calledSet)
  return calledSet;
}



document.addEventListener('DOMContentLoaded', async () => {
    const node = await Ipfs.create({ repo: 'ipfs-' + Math.random() })
    window.node = node
    const status = node.isOnline() ? 'online' : 'offline'
    console.log(`Node status: ${status}`)
    document.getElementById('status').innerHTML = `Node status: ${status}`
    // You can write more code here to use it. Use methods like
    // node.add, node.get. See the API docs here:
    // https://github.com/ipfs/interface-ipfs-core
  })

// async function addFile(){
//     var file = document.getElementById('file')
//     console.log(file.val())
// }
$('#addFile').on('click', '.submit',async function(event){
  var name = ($("#name").val())
  var description =($("#description").val())
  var file = ($('#file').val())

  console.log(name,description, file)
  console.log("------------------")
  const fileAdded = await node.add(file)
  fileAdded.forEach((file) => {
    const new_file = await contractCall('add_file', [name, description, file.hash],0);
    console.log("successfully stored", file.hash)
  })
})
