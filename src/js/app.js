App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // 从JSON文件加载宠物信息
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');
      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('.panel-name').attr('value',data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petsRow.append(petTemplate.html());
      }
    });
    return await App.initWeb3();
  },

//初始化WEB3，以太坊服务端
  initWeb3: async function() {
    // Modern dapp browsers...
            if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
              // Request account access
              await window.ethereum.enable();
            } catch (error) {
              // User denied account access...
              console.error("User denied account access")
            }
          }
          // Legacy dapp browsers...
          else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
          }
          // If no injected web3 instance is detected, fall back to Ganache
          else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }
          web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

//初始化智能合约
  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted(),App.markcname();

    });
    return App.bindEvents();
  },


  //给页面按钮注册单击事件
  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },


//标记已领养信息，通过去遍历adopters数组，找出不为默认值的，把它显示出来
  markAdopted: function(adopters, account) {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
       //返回领养人地址
       return adoptionInstance.getcname.call(),adoptionInstance.getAdopters.call();
    }).then(function(adopters,cnames) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          console.info("领养地址："+adopters[i]);
          console.info("cnames："+cnames[i]);
          //当前宠物被领养
          $('.panel-pet').eq(i).find('button').text('已领养').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  },
  //标记已领养信息，通过去遍历adopters数组，找出不为默认值的，把它显示出来
    markcname: function(adopters, account) {
      var adoptionInstance;
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
         //返回领养人地址
        return adoptionInstance.getcname.call();
      }).then(function(cnames) {
        for (i = 0; i < cnames.length; i++) {
          if (cnames[i] !== 0) {
            console.info("名字："+cnames[i]);
            //当前宠物被领养
          //  $('.panel-pet').eq(i).find('input').attr('value', "455");
          }
        }
      }).catch(function(err) {
        console.log(err.message);
      });

    },


//实现宠物领养功能
  handleAdopt: function(event) {
              event.preventDefault();
          //获取被领养宠物ID，parseInt将字符串改为INT
              var petId = parseInt($(event.target).data('id'));
              console.info("被领养宠物ID" + petId);

              var cname = $(event.target).data('id');
              console.info("名字" + cname);
          //实例化智能合约
              var adoptionInstance;//声明变量，用来存储合约示例
          //获取私有链的所有账户


              App.contracts.Adoption.deployed().then(function(instance) {
                adoptionInstance = instance;

                // Execute adopt as a transaction by sending account
                return adoptionInstance.adopt(petId);
              }).then(function(result) {
                console.info(result);
                //修改按钮状态
                return App.markAdopted();
              }).catch(function(err) {
                console.log(err.message);
              });
            }
};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
