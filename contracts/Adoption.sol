pragma solidity ^0.5.0;

contract Adoption {
  //创建一个地址数组adopters，16个地址
address[16] public adopters;
uint[16] public cnames;

// Adopting a pet
        function adopt(uint petId) public returns (uint) {
          require(petId >= 0 && petId <= 15);//判断PETID合法性
          adopters[petId] = msg.sender;//存储当前领养人的地址信息
          cnames[petId] = petId;
          return petId;
        }
//检索领养者的地址信息
        function getAdopters() public view returns (address[16] memory) {
          return adopters;
        }
//检索宠物名字
        function getcname() public view returns (uint[16] memory) {
                  return cnames;
                }

}
