angular.module('timetracker')
  .controller('EntriesController', function($localStorage, entryFactory, $log, $state, toastr, responseFactory) {
    var vm = this;
    vm.entries = [];

    vm.views = {
      formView: false,
      listView: true,
      detailedView: false,
      viewEditForm: false
    };

    vm.addEntry = {
      date: new Date(),
      quantity: "",
      description: ""
    };

    vm.opened = false;
    vm.detailedEntry = {};
    vm.detailedResponses = {};
    vm.open = function() {
      $log.log("opened");
      vm.opened = true;
    };

    function keysrt(key) {
      return function(a,b){
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
      }
    };

    entryFactory.getEntriesByUser($localStorage.user.id).then(function (result) {
      vm.entries = result.data.sort(keysrt('date'));
    });

    vm.showForm = function() {
      vm.views.formView = true;
      vm.views.listView = false;
      vm.views.detailedView = false;
      vm.views.viewEditForm = false;
    };

    vm.showList = function() {
      vm.views.formView = false;
      vm.views.listView = true;
      vm.views.detailedView = false;
      vm.views.viewEditForm = false;
        vm.addEntry = {
        date: new Date(),
          quantity: "",
        description: ""
      };
    };

    vm.showDetailed = function(entry) {
      responseFactory.getResponsesByEntry(entry.id).then(function(result) {
        vm.detailedEntry = entry;
        vm.detailedResponses = result.data;
        vm.views.formView = false;
        vm.views.listView = false;
        vm.views.detailedView = true;
        vm.views.viewEditForm = false;
      })
    };

    vm.showEditForm = function() {
      vm.views.viewEditForm = true;
      vm.addEntry = vm.detailedEntry;
      vm.addEntry.date = new Date();
    };

    vm.noResponses = function () {
      return vm.detailedResponses.isEmpty();
    };

    vm.isRejectedTask = function () {
      return (vm.detailedEntry != {} && vm.detailedEntry.status == 'Rejected');
    };

    vm.submit = function () {
      var entry = {
        'id': 0,
        'user': $localStorage.user,
        'date': Math.round(vm.addEntry.date.getTime()).toString(),
        'quantity': parseInt(vm.addEntry.quantity),
        'description': vm.addEntry.description,
        'status': 'Pending'
      };
      entryFactory.createEntry(entry).then(function(result) {
        vm.entries.push(result.data);
        vm.user = $localStorage.user;
        toastr.info('You have successfully created entry');
        vm.showList();
        vm.addEntry = {
          date: new Date(),
          quantity: "",
          description: ""
        };
      }).catch(function(response) {
        toastr.info(response.data.message);
      });
    };

    vm.submitEditForm = function () {
      var entry = {
        'id': 0,
        'user': $localStorage.user,
        'date': Math.round(vm.addEntry.date.getTime()).toString(),
        'quantity': parseInt(vm.addEntry.quantity),
        'description': vm.addEntry.description,
        'status': 'Pending'
      };

      entryFactory.editEntry(vm.detailedEntry.id, entry).then(function(result) {
        toastr.info('You have successfully edited entry');
        vm.addEntry = {
          date: new Date(),
          quantity: "",
          description: ""
        };
        vm.views.viewEditForm = false;
        $state.go("home");
      }).catch(function(response) {
        toastr.info(response.data.message);
      });
    };

  });