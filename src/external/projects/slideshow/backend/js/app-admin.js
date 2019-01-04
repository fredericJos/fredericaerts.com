angular
    .module('app')
    .controller('ShellCtrl', ['$scope', '$element', '$rootScope', '$state', '$timeout', '$mdMedia', '$mdSidenav', '$mdUtil',
  function($scope, $element, $rootScope, $state, $timeout, $mdMedia, $mdSidenav, $mdUtil) {
    'use strict';

    var vm = this;

    vm.isSigningIn = false;
    vm.signIn = signIn;

    vm.toggleSidenavLeft = buildToggler('left');
    vm.toggleSidenavRight = buildToggler('right');
    vm.sideNavUserMenuIsCollapsed = true;
    vm.toggleSideNavUserMenu = toggleSideNavUserMenu;
    vm.toggleSubNav = toggleSubNav;
    vm.navigateFromSidenav = navigateFromSidenav;
    vm.sideNavLeft = {
      isOpen: false,
      items: [
        {
          name: 'Accounts',
          state: 'accounts',
          activeStates: ['accounts'],
          icon:'business',
          subNavHeight: 0,
          subItems: [],
          collapsed: true
        },
        {
          name: 'Hubs',
          state: 'hubs',
          activeStates: ['hubs', 'account-hubs'],
          icon: 'web',
          subNavHeight: 0,
          subItems: [],
          collapsed: true
        },
        {
          name: 'Users',
          state: 'users',
          activeStates:['users', 'user-profile'],
          icon: 'account_circle',
          subNavHeight: 0,
          subItems: [],
          collapsed: true
        }
      ]
    };
    vm.sideNavUserIsOnline = false;
    vm.sideNavUserMenuHeight = 0;
    vm.sideNavUserMenuItems = [
      {
        name: 'Profile',
        icon: 'account_circle',
        linkState: 'user-profile'
      },
      {
        name: 'Account',
        icon: 'business',
        linkState: '#'
      }
    ];

    vm.appBar = {
      buttons: [
        {
          name: 'More',
          icon: 'account_circle',
          companionIcon: false,
          notificationCount: 0,
          menu: {
            width: 3,
            items: [
              {
                title: 'Profile',
                hasDivider: false,
                clickHandler: function() {
                  $state.go('user-profile');
                }
              },
              {
                title: 'Logout',
                hasDivider: true,
                clickHandler: function() {}
              }
            ]
          },
          clickHandler: function($event, $mdOpenMenu){
            $mdOpenMenu($event);
            this.notificationCount = 0;
          }
        }
      ]
    };

    activate();

    function activate() {
      initPageLoader();

      if ($mdMedia('gt-md')) {
        vm.toggleSidenavLeft(); // open navigation drawer
      }
    }

    /*  EVENT LISTENERS
        =========================================== */
    angular.element(window).bind('resize', handleWindowResize);

    $rootScope.$on('sidenavLeft:toggle', function() {
      $timeout(function() {
        vm.toggleSidenavLeft(); // open navigation drawer
      });
    });

    /* FUNCTIONS
      =========================================== */
    function initPageLoader() {
      window.onload = function() {
        $timeout(function() {
          vm.isAppLoaded = true;
        }, 100);
        $timeout(function() {
          // force .5s delay while page-loader is fading out
          $rootScope.appIsActivated = true;
        }, 600);
      };
    }

    function signIn() {
      if(!vm.isSigningIn) {
        vm.isSigningIn = true;
      }
      else {
        window.location.href = '../';
      }
    }

    function buildToggler(navID) {
      var debounceFn = $mdUtil.debounce(function(){
            $mdSidenav(navID).toggle();
            if (navID === 'left') {
              vm.sideNavLeft.isOpen = $mdSidenav(navID).isOpen();
              $rootScope.sidenavLocked = $mdMedia('gt-md') && vm.sideNavLeft.isOpen;
            }
          },200);
      return debounceFn;
    }

    function toggleSideNavUserMenu() {
      vm.sideNavUserMenuIsCollapsed = !vm.sideNavUserMenuIsCollapsed;
      //TODO: dissociate css and js (45px)
      vm.sideNavUserMenuHeight = vm.sideNavUserMenuHeight ? 0 : vm.sideNavUserMenuItems.length*45 + 'px';
    }

    function toggleSubNav(navItemName) {
      vm.sideNavLeft.items.map(function(item) {
        item.collapsed = item.name === navItemName ? !item.collapsed : true;
        //TODO: dissociate css and js (35px)
        item.subNavHeight = item.collapsed ? 0 : item.subItems.length*35 + 'px';
        return item;
      });
    }

    function navigateFromSidenav() {
      if(!$mdMedia('gt-md')) {
       vm.toggleSidenavLeft();
      }
    }

    function handleWindowResize() {
      $rootScope.sidenavLocked = $mdMedia('gt-md') && vm.sideNavLeft.isOpen;
    }
  }
]);

(function() {
    'use strict';

    angular
        .module('app')
        .directive('messageWindow', messageWindow);

    messageWindow.$inject = ['TEMPLATES_ROOT'];

    function messageWindow(TEMPLATES_ROOT) {
        var directive = {
            templateUrl: TEMPLATES_ROOT + '/layout/message-window.tmpl.html',
            bindToController: true,
            controller: MessageWindowController,
            controllerAs: 'messageWindow',
            link: link,
            restrict: 'E',
            scope: {
                conversation: '='
            }
        };
        return directive;

        function link() {
        }
    }

    MessageWindowController.$inject = ['$scope', '$rootScope', '$element', '$timeout'];
    function MessageWindowController($scope, $rootScope, $element, $timeout) {
        var vm = this;

        vm.newMessage = '';
        vm.sendNewMessage = sendNewMessage;
        vm.closeWindow = closeWindow;
        vm.minimizeWindow = minimizeWindow;
        vm.windowMinimized = false;

        // cached DOM variables
        var directiveElement = angular.element($element);
        var messageWindowElement = angular.element($element.children()[0]);
        var conversationMessageWindowElement = angular.element(messageWindowElement.children()[1]);

        activate();

        function activate() {
            initTextArea();

            scrollMessageBoxToBottom(); // jQuery!
        }

        /*  FUNCTIONS
            =========================================== */
        function initTextArea() {
            var textAreaElement = directiveElement.find('textarea');
            var bottomPanelElement = textAreaElement.parent();
            var bottomPanelElementHeight = parseInt(bottomPanelElement.css('height'), 10);
            var initialTextAreaHeight = parseInt(textAreaElement.css('height'), 10);

            // init autoresize
            autosize(textAreaElement);
            bottomPanelElement.css('min-height', bottomPanelElementHeight + 'px');
            textAreaElement.bind('autosize:resized', function(){
                if (!initialTextAreaHeight) {
                    initialTextAreaHeight = parseInt(textAreaElement.css('height'), 10);
                    return;
                }
                else {
                    var heightDiff = parseInt(textAreaElement.css('height'), 10) - initialTextAreaHeight;
                    bottomPanelElement.css('height', bottomPanelElementHeight + heightDiff + 'px');
                }

            });

            // handle enter key press
            textAreaElement.bind('keydown keypress', function(event){
                if (event.which === 13) {
                    sendNewMessage();
                    $scope.$apply();
                    return false;
                }
            });
        }

        function sendNewMessage() {
            if(!vm.newMessage) {
                return;
            }
            var newMessageObject = {
                from: 'you',
                time: getCurrentTime(),
                content: vm.newMessage
            };
            vm.conversation.messages.push(newMessageObject);
            vm.newMessage = '';
            $timeout(function() {
                autosize.update(directiveElement.find('textarea'));
            }, 0);
            scrollMessageBoxToBottom(); // jQuery!
        }

        function getCurrentTime() {
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        function scrollMessageBoxToBottom() { // jQuery!
            $timeout(function() {
                $(conversationMessageWindowElement[0]).scrollTop(99999999999);
            }, 0);
        }

        function minimizeWindow() {
            vm.windowMinimized = !vm.windowMinimized;
        }

        function closeWindow() {
            $scope.$emit('closeMessageWindow', vm.conversation); // notify ShellCtrl
        }
    }
})();

/*  Only used in admin & probably deprecated
    ============================================================ */

angular
    .module('app')
    .controller('PrimaryHeaderCtrl', [
      function() {
        'use strict';

        var vm = this;

        vm.formUpdated = false;

        vm.accountHeaderCompany = 'Economist Intelligence Unit';
        vm.accountHeaderSubdomain = 'eiu';
        vm.customDomain = '';

        vm.firstName = 'Bruno';
        vm.lastName = 'Fernandes';
        vm.email = 'Bruno.fernandes@wavecastpro.com';
      }
    ]);

angular
    .module('app')
    .controller('SpeedDialCtrl', ['$mdDialog','TEMPLATES_ROOT',
      function($mdDialog, TEMPLATES_ROOT) {
        'use strict';

        var vm = this;

        vm.addUser = function(ev) {
          $mdDialog.show({
            controller: DialogController,
            templateUrl: TEMPLATES_ROOT + '/speed-dial/dialog-add-user.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          });
        };

        vm.addAccount = function(ev) {
          $mdDialog.show({
            controller: DialogController,
            templateUrl: TEMPLATES_ROOT + '/speed-dial/dialog-add-account.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          });
        };

        vm.addHub = function(ev) {
          $mdDialog.show({
            controller: DialogController,
            templateUrl: TEMPLATES_ROOT + '/speed-dial/dialog-add-hub.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          });
        };

        vm.addNewContent = function(ev) {
          $mdDialog.show({
            controller: NewContentDialogController,
            templateUrl: TEMPLATES_ROOT + '/speed-dial/dialog-new-content.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:false
          });
        };

        function DialogController($scope, $mdDialog) {
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.add = function(type) {
            console.log('add ' + type);
            // $mdDialog.hide();
          };
        }

        function NewContentDialogController($scope, $mdDialog, $state) {
          $scope.pageTemplates = [
            {
                id: 1,
                name: 'Article',
                img: 'SidebarLeft.png',
                imgRetina: 'SidebarLeft@2x.png'
            },
            {
                id: 2,
                name: 'Blog',
                img: 'Centred.png',
                imgRetina: 'Centred@2x.png'
            },
            {
                id: 3,
                name: 'Case study',
                img: 'SidebarRight.png',
                imgRetina: 'SidebarRight@2x.png'
            },
            {
                id: 4,
                name: 'Data',
                img: 'Central-WidgetRowTop.png',
                imgRetina: 'Central-WidgetRowTop@2x.png'
            },
            {
                id: 5,
                name: 'Document',
                img: 'Central-WidgetRowBottom.png',
                imgRetina: 'Central-WidgetRowBottom@2x.png'
            },
            {
                id: 6,
                name: 'Infographic',
                img: 'Central-WidgetRowBottom.png',
                imgRetina: 'Central-WidgetRowBottom@2x.png'
            },
            {
                id: 7,
                name: 'Report',
                img: 'Central-WidgetRowBottom.png',
                imgRetina: 'Central-WidgetRowBottom@2x.png'
            },
            {
                id: 8,
                name: 'Session',
                img: 'Central-WidgetRowBottom.png',
                imgRetina: 'Central-WidgetRowBottom@2x.png'
            },
            {
                id: 9,
                name: 'Video',
                img: 'Central-WidgetRowBottom.png',
                imgRetina: 'Central-WidgetRowBottom@2x.png'
            }
          ];
          $scope.selectedTemplateId = undefined;

          $scope.navigateTo = function(state) {
            $mdDialog.cancel();
            $state.go(state);
          };
        }
      }
    ]);

angular
    .module('app')
    .controller('ContentSectionCtrl', ['$rootScope', '$scope', '$mdToast', '$document', '$timeout', '$interval', 'contentService',
      function($rootScope, $scope, $mdToast, $document, $timeout, $interval, contentService) {
        'use strict';

        $rootScope.pageName = 'Content';

        var vm = this;

        vm.header = {
            breadcrumb: null,
            tabs: [
                {
                    name: 'content',
                    clickHandler: function(){vm.selectedTab = 1;}
                },
                {
                    name: 'assets',
                    clickHandler: function(){vm.selectedTab = 2;}
                },
                {
                    name: 'types',
                    clickHandler: function(){vm.selectedTab = 2;}
                }
            ],
            tabsBlockOptions: [
                {
                    icon: 'view_module',
                    label: 'Modules',
                    clickHandler: switchListType,
                    menu: null
                },
                {
                    icon: 'filter_list',
                    label: 'Filter',
                    clickHandler: function(){},
                    menu: {
                        canTickMultiple: true,
                        width: 3,
                        options: [
                            {
                                name: 'Articles',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Blog post',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Chart',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Session',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Document',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Presentation',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Infographic',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'eBook',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Report',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Case study',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Interview',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Video',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            }
                        ]
                    }
                },
                {
                    icon: 'sort_by_alpha',
                    label: 'Sort',
                    clickHandler: function(){},
                    menu: {
                        canTickMultiple: false,
                        width: 4,
                        options: [
                            {
                                name: 'Last modified',
                                icon: null,
                                selected: true,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Last modified by me',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Most popular',
                                icon: null,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            }
                        ]
                    }
                },
                {
                    icon: 'search',
                    label: 'Search',
                    clickHandler: function(){},
                    menu: null
                },
                {
                    icon: 'more_vert',
                    label: 'More',
                    clickHandler: function(){},
                    menu: {
                        canTickMultiple: false,
                        width: 3,
                        options: [
                            {
                                name: 'Share',
                                icon: 'person_add',
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Settings',
                                icon: 'settings',
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Help',
                                icon: 'help',
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            }
                        ]
                    }
                }
            ]
        };

        // Articles
        vm.articles = [];
        vm.articlesPerPage = 10;
        vm.articlesInGrid = false;
        vm.switchListType = switchListType;
        vm.inListTypeTransition = false;

        // vm.actionsbar = {
        //     show: false,
        //     selectAll: false,
        //     buttons: [
        //         {
        //             icon: 'local_offer',
        //             label: 'Offer',
        //             clickHandler: function(){},
        //             menu: null
        //         },
        //         {
        //             icon: 'delete',
        //             label: 'Delete',
        //             clickHandler: function(){},
        //             menu: null
        //         },
        //         {
        //             icon: 'more_horiz',
        //             label: 'More',
        //             clickHandler: function(){},
        //             menu: {
        //                 canTickMultiple: false,
        //                 menuWidth: 3,
        //                 options: [
        //                     {
        //                         name: 'Share',
        //                         icon: 'person_add',
        //                         selected: false,
        //                         clickHandler: menuOptionClickHandler
        //                     },
        //                     {
        //                         name: 'Assign to Zone',
        //                         icon: 'forward',
        //                         selected: false,
        //                         clickHandler: menuOptionClickHandler
        //                     },
        //                     {
        //                         name: 'Copy',
        //                         icon: 'content_copy',
        //                         selected: false,
        //                         clickHandler: menuOptionClickHandler
        //                     }
        //                 ]
        //             }
        //         }
        //     ]
        // };
        vm.numberOfArticlesChecked = 0;
        vm.allArticlesSelected = false;
        vm.stickyFooterArticles = {
            buttons: [
                {
                    icon: 'local_offer',
                    label: 'Offer',
                    clickHandler: function(){}
                },
                {
                    icon: 'file_download',
                    label: 'download',
                    clickHandler: function(){}
                },
                {
                    icon: 'delete',
                    label: 'Delete',
                    clickHandler: function(){}
                }
            ],
            action: {
                text: 'Convert',
                clickHandler: function(){
                    showActionToast();
                    vm.articles.map(function(article) {
                        article.checked = false;
                        return article;
                    });
                }
            }
        };
        vm.articleRoute = 'article';

        // Assets
        vm.assets = [];
        vm.numberOfAssetsChecked = 0;
        vm.allAssetsSelected = false;
        vm.openAssetPanel = openAssetPanel;
        vm.stickyFooterAssets = {
            buttons: [
                {
                    icon: 'local_offer',
                    label: 'Offer',
                    clickHandler: function(){}
                },
                {
                    icon: 'file_download',
                    label: 'download',
                    clickHandler: function(){}
                },
                {
                    icon: 'delete',
                    label: 'Delete',
                    clickHandler: function(){}
                }
            ],
            action: {
                text: 'Convert',
                clickHandler: function(){
                    showActionToast();
                    vm.assets.map(function(asset) {
                        asset.checked = false;
                        return asset;
                    });
                }
            }
        };

        activate();

        /*  WATCHES
            ====================================================== */
        $scope.$watch(function watchAllArticlesSelected() {
            return vm.allArticlesSelected;
        },
        function(newValue, oldValue) {
            if(newValue !== oldValue){
                vm.articles.forEach(function(article) {
                    article.checked = newValue;
                });
            }
        });

        $scope.$watch(function watchAllAssetsSelected() {
            return vm.allAssetsSelected;
        },
        function(newValue, oldValue) {
            if(newValue !== oldValue){
                vm.assets.forEach(function(asset) {
                    asset.checked = newValue;
                });
            }
        });


        /*  FUNCTIONS
            =================================================== */
        function activate() {
            getArticles().then(function() {
                // Watch articles being checked
                vm.articles.forEach(function(article) {
                    $scope.$watch(function watchArticleChecked() {
                        return article.checked;
                    },
                    function(newValue, oldValue) {
                        if(newValue !== oldValue){
                            vm.numberOfArticlesChecked += newValue ? 1 : -1;
                            // vm.actionsbar.show = vm.numberOfArticlesChecked;
                        }
                    });
                });
            });

            getAssets().then(function() {
                // Watch assets being checked
                vm.assets.forEach(function(asset) {
                    $scope.$watch(function watchAssetChecked() {
                        return asset.checked;
                    },
                    function(newValue, oldValue) {
                        if(newValue !== oldValue){
                            vm.numberOfAssetsChecked += newValue ? 1 : -1;
                        }
                    });
                });
            });
        }

        function menuOptionClickHandler(option) {
            if(!this.icon) { // is a select menu
                if(!option.menu.canTickMultiple) {
                    option.menu.options.forEach(function(menuOption) {
                        menuOption.selected = false;
                        return;
                    });
                }
                this.selected = !this.selected;
            }
            else {
                return;
            }
        }

        function getArticles() {
            return contentService.getArticles()
            .then(function(data) {
                vm.articles = data;
                return vm.articles;
            });
        }

        function getAssets() {
            return contentService.getAssets()
            .then(function(data) {
                vm.assets = data;
                return vm.assets;
            });
        }

        function switchListType() {
            vm.inListTypeTransition = true;
            $timeout(function() {
                vm.articlesInGrid = !vm.articlesInGrid;
            }, 200)
            .then(function() {
                $timeout(function() {
                    vm.inListTypeTransition = false;
                }, 400);
            });
        }

        function openAssetPanel(asset) {
            if(asset.panel) {
                asset.panel.active = !asset.panel.active;
                asset.panel.progress = 0;

                if(asset.panel.active && asset.panel.hasProgressBar) {
                    var stop = $interval(function() {
                        if(asset.panel.progress === 100 || !asset.panel.active) {
                            $interval.cancel(stop);
                        }
                        else {
                            asset.panel.progress += 2;
                        }
                    }, 25);
                }
            }
        }

        function showActionToast() {
            var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
            };
            var toast = $mdToast.simple()
                .parent($document[0].querySelector('#content'))
                .textContent('Updates pushed live.')
                .action('UNDO')
                .highlightAction(true)
                .position(getToastPosition(last))
                .hideDelay(3000);
            $mdToast.show(toast).then(function(response) {
                if ( response === 'ok' ) {
                    console.log('undo');
                }
            });

            function getToastPosition(last) {
                sanitizePosition(last);
                return Object.keys(angular.extend({},last))
                  .filter(function(pos) { return angular.extend({},last)[pos]; })
                  .join(' ');
            }

            function sanitizePosition(last) {
                var current = angular.extend({},last);
                if ( current.bottom && last.top ) {current.top = false;}
                if ( current.top && last.bottom ) {current.bottom = false;}
                if ( current.right && last.left ) {current.left = false;}
                if ( current.left && last.right ) {current.right = false;}
                last = angular.extend({},current);
            }
        }
    }]);

angular
    .module('app')
    .factory('contentService', contentService);

contentService.$inject = ['$http', 'DATA_ROOT'];

function contentService($http, DATA_ROOT) {
    'use strict';
    return {
        getArticles: getArticles,
        getAssets: getAssets
    };

    function getArticles() {
        return $http.get(DATA_ROOT + '/page-content/articles.json')
            .then(getArticlesComplete)
            .catch(getArticlesFailed);

        function getArticlesComplete(response) {
            return response.data.articles;
        }

        function getArticlesFailed(error) {
            // error handling
            console.log(error.message);
        }
    }

    function getAssets() {
        return $http.get(DATA_ROOT + '/page-content/assets.json')
            .then(getAssetsComplete)
            .catch(getAssetsFailed);

        function getAssetsComplete(response) {
            return response.data.assets;
        }

        function getAssetsFailed(error) {
            // error handling
            console.log(error.message);
        }
    }
}

angular
    .module('app')
    .controller('ContentEditSectionCtrl', ['$scope', '$state', '$window', '$mdDialog', 'TEMPLATES_ROOT', '$timeout',
      function($scope, $state, $window, $mdDialog, TEMPLATES_ROOT, $timeout) {
        'use strict';

        /*  VARIABLES
            =================================================== */
        var monthNames = [
          'Jan', 'Feb', 'Mar',
          'Apr', 'May', 'Jun', 'Jul',
          'Aug', 'Sep', 'Oct',
          'Nov', 'Dec'
        ];

        /*  EVENT HANDLERS
            =================================================== */
        angular.element($window).bind('click', function() {
          vm.chipsReadOnly = true;
          $scope.$apply();
        });

        /*  VIEW MODEL
            =================================================== */
        var vm = this;

        vm.selectedTab = 1;
        vm.header = {
            breadcrumb: [
              {
                link: 'content',
                name: 'Content'
              },
              {
                link: '',
                name: 'Virtually real, actually here?'
              }
            ],
            tabs: [
                {
                    name: 'edit',
                    clickHandler: function(){vm.selectedTab = 1;}
                }
                // {
                //     name: 'timeline',
                //     // isSelected: true,
                //     clickHandler: function(){vm.selectedTab = 3;}
                // }
            ],
            tabsBlockOptions: [
                {
                    icon: 'launch_icon',
                    label: 'Launch in new window',
                    clickHandler: function(){$window.open('http://thefutureishere.economist.com/virtually-real-actually-here', '_blank');},
                    menu: null
                },
                {
                    icon: 'more_vert',
                    label: 'More',
                    clickHandler: function(){},
                    menu: {
                        canTickMultiple: false,
                        width: 3,
                        options: [
                            {
                                name: 'Share',
                                icon: 'person_add',
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Access',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                divider: true,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Automation',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Connections',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Customise',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Layout',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Versions',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Engagement',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Timeline',
                                icon: '',
                                isDynamicTab: true,
                                selected: false,
                                clickHandler: menuOptionClickHandler
                            },
                            {
                                name: 'Help',
                                icon: 'help',
                                selected: false,
                                divider: true,
                                clickHandler: menuOptionClickHandler
                            }
                        ]
                    }
                }
            ]
        };
        vm.headerDynamicTabIndex = -1;

        vm.stickyFooter = {
          links: [
            {
              text: 'preview updates',
              icon: 'launch'
            },
            {
              text: 'schedule',
              icon: 'today'
            }
          ],
          action: {
            text: 'Push live'
          }
        };
        vm.versionsDropdown = [
          'Live version A',
          'Live version B',
          'Scheduled 1',
          'Scheduled 2'
        ];
        vm.versionSelected = 'Live version A';
        vm.isEditing = false;
        vm.chips = [
          'EIU',
          'Virtual reality',
          'Technology'
        ];
        vm.chipsReadOnly = true;
        vm.enableChipsEditing = enableChipsEditing;

        vm.isEditingImage = false;
        vm.editImage = editImage;

        vm.MetadataController = MetadataController;
        vm.FormatsController = FormatsController;
        vm.EditImageController = EditImageController;

        vm.timelineItems = [
          {
            intro: {
              date: '12.41 am',
              avatar: 'profile_picture.jpg',
              avatarRetina: 'profile_picture.jpg',
              text: 'Alex Bridges edited Body, Sub-title and Twitter Metadata to LOGGED IN ONLY state'
            },
            meta: {
              image: {
                img: 'VR_Article_Full.jpg',
                imgRetina: 'VR_Article_Full.jpg',
              }
            }
          },
          {
            intro: {
              date: '12.41 am',
              avatar: 'profile_picture.jpg',
              avatarRetina: 'profile_picture.jpg',
              text: 'Alex Bridges edited Body, Sub-title and Twitter Metadata to LOGGED IN ONLY state'
            },
            meta: null
          },
          {
            intro: {
              date: '12.41 am',
              avatar: 'profile_picture.jpg',
              avatarRetina: 'profile_picture.jpg',
              text: 'Alex Bridges edited Body, Sub-title and Twitter Metadata to LOGGED IN ONLY state'
            },
            meta: {
              avatars: [
                'placeholder',
                'profile_picture.jpg'
              ]
            }
          }
        ];

        // ./new


        vm.getFormattedDate = getFormattedDate;
        vm.img = 'VR_Article_Full.jpg';
        vm.title = 'Virtually real, actually here?';
        vm.titleSubmitted = true;
        vm.publishers = [
          'The Economist Intelligence Unit',
          'Another Publisher',
          'And Another'
        ];
        vm.publisher = vm.publishers[0];
        vm.publisherSubmitted = true;
        vm.date = new Date();
        vm.dateFormatted = getFormattedDate(vm.date);
        vm.dateSubmitted = true;
        vm.openDatePicker = openDatePicker;
        vm.froalaHTMLSubmitted = true;
        vm.allSubmitted = false;
        vm.versions = [
          {
            'img': 'article-list-VR.jpg',
            'imgRetina': 'article-list-VR.jpg',
            'title': 'When video is available',
            'intro': 'At the forefront of the next wave of change is virtual reality (VR)',
            'status': 'Scheduled For DEC 24',
            'scheduled': true
          },
          {
            'img': 'article-list-VR.jpg',
            'imgRetina': 'article-list-VR.jpg',
            'title': 'On the day of the version',
            'intro': 'At the forefront of the next wave of change is virtual reality (VR)',
            'status': 'Published from JUNE 20 - OCTOBER 12',
            'scheduled': false
          },
          {
            'img': 'article-list-VR.jpg',
            'imgRetina': 'article-list-VR.jpg',
            'title': 'Pre-event version',
            'intro': 'At the forefront of the next wave of change is virtual reality (VR)',
            'status': 'Published from JUNE 20 - OCTOBER 12',
            'scheduled': false
          },
        ];
        vm.uploadImage = function(ev) {
            $mdDialog.show({
              controller: DialogController,
              templateUrl: TEMPLATES_ROOT + '/articles/dialog-upload-image.tmpl.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true
            });
          };

        /*  SUBCONTROLLERS
            =================================================== */
        function MetadataController() {
          // subsection hijackinging parent sectionCtrl
          var vmMetadata = this;

          vmMetadata.header = {
            breadcrumb: null,
            tabs: [
                {
                    name: 'search',
                    clickHandler: function(){vm.selectedTab = 1;}
                },
                {
                    name: 'twitter',
                    clickHandler: function(){vm.selectedTab = 2;}
                },
                {
                    name: 'linkedin',
                    clickHandler: function(){vm.selectedTab = 3;}
                },
                {
                    name: 'google+',
                    clickHandler: function(){vm.selectedTab = 4;}
                },
                {
                    name: 'facebook',
                    clickHandler: function(){vm.selectedTab = 5;}
                }
            ],
            tabsBlockOptions: null
          };

          vmMetadata.img = vm.img;
          vmMetadata.title = vm.title;
        }

        function FormatsController() {
          // subsection hijackinging parent sectionCtrl
          var vmFormats = this;

          vmFormats.header = {
            breadcrumb: null,
            tabs: [
                {
                    name: 'cards',
                    clickHandler: function(){vm.selectedTab = 1;}
                },
                {
                    name: 'widgets',
                    clickHandler: function(){vm.selectedTab = 2;}
                }
            ],
            tabsBlockOptions: null
          };

          vmFormats.img = vm.img;
          vmFormats.title = vm.title;
          vmFormats.publisher = vm.publisher;
        }

        function EditImageController() {
          // subsection hijackinging parent sectionCtrl
          var vmEditImage = this;
          var aspectRatios = ['16:9','4:3','1:1','1:2'];
          vmEditImage.currentAspectRatio = aspectRatios[0];


          vmEditImage.header = {
            tabs: [
                {
                  name: 'header',
                  isLabel: true,
                  clickHandler: function(){}
                },
                {
                  name: '16:9',
                  clickHandler: function(){
                    vm.cropper.setAspectRatio(16/9);
                  }
                },
                {
                  name: '4:3',
                  clickHandler: function(){
                    vm.cropper.setAspectRatio(4/3);
                  }
                },
                {
                  name: '1:1',
                  clickHandler: function(){
                    vm.cropper.setAspectRatio(1);
                  }
                },
                {
                  name: '1:2',
                  clickHandler: function(){
                    vm.cropper.setAspectRatio(1/2);
                  }
                }
            ],
            tabsBlockOptions: null
          };

          vmEditImage.cropButtons = [
            {
                icon: 'arrow_back',
                label: 'moveLeft',
                clickHandler: moveLeft
            },
            {
                icon: 'arrow_forward',
                label: 'moveRight',
                clickHandler: moveRight
            },
            {
                icon: 'arrow_upward',
                label: 'moveUp',
                clickHandler: moveUp
            },
            {
                icon: 'arrow_downward',
                label: 'moveDown',
                clickHandler: moveDown
            },
            {
                icon: 'rotate_left',
                label: 'rotateLeft',
                clickHandler: rotateLeft
            },
            {
                icon: 'rotate_right',
                label: 'rotateRight',
                clickHandler: rotateRight
            },
            {
                icon: 'add_circle_outline',
                label: 'zoomIn',
                clickHandler: zoomIn
            },
            {
                icon: 'remove_circle_outline',
                label: 'zoomOut',
                clickHandler: zoomOut
            }
          ];

          /*  EDIT IMAGE FUNCTIONS
            =================================================== */
            function moveLeft() {
                vm.cropper.move(-2, 0);
            }

            function moveRight() {
                vm.cropper.move(2, 0);
            }

            function moveUp() {
                vm.cropper.move(0, -2);
            }

            function moveDown() {
                vm.cropper.move(0, 2);
            }

            function rotateLeft() {
                vm.cropper.rotate(-90);
            }

            function rotateRight() {
                vm.cropper.rotate(90);
            }

            function zoomIn() {
                vm.cropper.zoom(0.05);
            }

            function zoomOut() {
                vm.cropper.zoom(-0.05);
            }
        }

        /*  FUNCTIONS
            =================================================== */
        function menuOptionClickHandler(option) {
            if (this.isDynamicTab) {
              var tabName = this.name;
              vm.selectedTab = tabName.toLowerCase();
              console.log(vm.selectedTab);
              vm.header.tabs.forEach(function(tab) {
                  tab.isSelected = false;
                  return tab;
                });
                vm.header.tabs = vm.header.tabs.filter(function(tab) {
                  return !tab.isDynamic;
                });
                vm.header.tabs.push({
                    name: tabName,
                    isSelected: true,
                    isDynamic: true,
                    clickHandler: function(){vm.selectedTab = tabName.toLowerCase();}
                });
            }

            if(!this.icon) { // is a select menu
                if(!option.menu.canTickMultiple) {
                    option.menu.options.forEach(function(menuOption) {
                        menuOption.selected = false;
                        return;
                    });
                }
                this.selected = !this.selected;
            }
            else {
                return;
            }
        }

        function enableChipsEditing($event) {
          vm.chipsReadOnly = false;
          $event.stopPropagation();
        }

        function editImage() {
          vm.isEditingImage = !vm.isEditingImage;
          var image = document.getElementById('image');
          vm.cropper = new Cropper(image, {
          aspectRatio: 16 / 9,
          viewMode: 3,
          preview: '.pp-cropper-preview'
          });
        }

        // ./new

        function getFormattedDate(date) {
          var day = date.getDate();
          var monthIndex = date.getMonth();
          var year = date.getFullYear();

          return day + ' ' + monthNames[monthIndex] + ' ' + year;
        }

        function openDatePicker($event) {
          vm.dateSubmitted = false;
          $timeout(function() {
            angular.element($event. target).next().children().trigger('click');
          }, 0);
          $event.stopPropagation();
        }

        function DialogController($scope, $mdDialog) {
            $scope.activeImageIndex = 0;
            $scope.close = function() {
              $mdDialog.hide();
            };
            $scope.assign = function() {
              $mdDialog.hide();
            };
          }
      }
    ]);

angular
    .module('app')
    .controller('PresentationSectionCtrl', ['TEMPLATES_ROOT', 'IMAGES_ROOT', '$window', '$document', '$rootScope', '$scope', '$state', '$mdMedia', '$mdDialog', '$timeout', 'contentService',
      function(TEMPLATES_ROOT, IMAGES_ROOT, $window, $document, $rootScope, $scope, $state, $mdMedia, $mdDialog, $timeout, contentService) {
        'use strict';

        /*  VIEW MODEL
            =================================================== */
        var vm = this;

        vm.selectedTab = 1;
        vm.header = {
            breadcrumb: null,
            options: [
              {
                icon: null,
                label: 'Live Session',
                isLabel: true,
                clickHandler: function(){},
                menu: null
              },
            ],
            tabs: [
                {
                    name: 'present',
                    clickHandler: function(){vm.selectedTab = 1;}
                },
                {
                    name: 'material',
                    clickHandler: function(){vm.selectedTab = 2;}
                }
            ],
            tabsBlockOptions: [
                {
                    icon: 'view_module',
                    label: 'Modules',
                    clickHandler: switchSlideNavigationType,
                    onTab: 1,
                    menu: null
                },
                {
                    icon: 'launch',
                    label: 'full screen',
                    clickHandler: openFullScreenDialog,
                    onTab: 1,
                    menu: null
                },
                {
                    icon: 'view_module',
                    label: 'Modules',
                    clickHandler: switchListType,
                    onTab: 2,
                    menu: null
                }
            ]
        };

        vm.isLiveDisplay = true;
        vm.slides = getSlides();
        vm.activeSlideIndex = 0;
        vm.activeSlide = vm.slides[vm.activeSlideIndex];
        vm.activateSlide = activateSlide;
        vm.navigateToNextSlide = navigateToNextSlide;
        vm.navigateToPrevSlide = navigateToPrevSlide;
        vm.moveSlidesbarToLeft = moveSlidesbarToLeft;
        vm.moveSlidesbarToRight = moveSlidesbarToRight;
        vm.sortableConfigSlidePreviews = {
            handle: '.sortable-handle',
            ghostClass: 'sortable-ghost',
            animation: 150,
            onEnd: function () {
                for (var i = 0; i < vm.slides.length; i++) {
                    if (vm.slides[i].isActive) {
                        vm.activeSlideIndex = i;
                        break;
                    }
                }
            }
        };
        vm.isSlidesPreviewHidden = true;
        vm.flipSlide = flipSlide;
        vm.slidesInGrid = true;
        vm.slideNavigationInGrid = true;
        vm.inListTypeTransition = false;
        vm.showSlideInDialog = showSlideInDialog;
        vm.addSelectedAttachment = addSelectedAttachment;
        vm.keyDownOnAutocompleteAttachments = keyDownOnAutocompleteAttachments;
        vm.openAddSlideDialog = openAddSlideDialog;

        /* feed */
        vm.incomingTwitterChips = [
          '#SWW16'
        ];
        vm.incomingTwitterChipsModerated = false;
        vm.incomingNewTwitterFeedPost = '';
        vm.incomingFeedItems = getFeedTweets(7);
        vm.prependIncomingFeedItems = prependIncomingFeedItems;
        vm.numberOfIncomingFeedItemsChecked = 0;
        vm.stickyFooterIncoming = {
            buttons: [
                {
                    icon: 'local_offer',
                    label: 'Offer',
                    clickHandler: function(){}
                },
                {
                    icon: 'file_download',
                    label: 'download',
                    clickHandler: function(){}
                },
                {
                    icon: 'delete',
                    label: 'Delete',
                    clickHandler: function(){}
                }
            ],
            action: {
                text: 'Push live',
                clickHandler: function(){
                    vm.incomingFeedItems.forEach(function(tweet) {
                        tweet.checked = false;
                    });
                }
            }
        };

        activate();

        function activate() {
            $timeout(function() {
                if ($rootScope.sidenavLocked) {
                    $scope.$emit('sidenavLeft:toggle'); // notify ShellController
                }
            }, 0);
        }

        /*  WATCHES
            ====================================================== */
        vm.incomingFeedItems.forEach(function(tweet) {
            $scope.$watch(function watchTweetChecked() {
                return tweet.checked;
            },
            function(newValue, oldValue) {
                if(newValue !== oldValue){
                    vm.numberOfIncomingFeedItemsChecked += newValue ? 1 : -1;
                }
            });
        });

        /*  LISTENERS
            ====================================================== */
        $document.bind('keydown keypress', function (event) {
            event = event || window.event;
            if (vm.selectedTab === 1 && event.keyCode === 37) {
               navigateToPrevSlide();
               $scope.$apply();
            }
            else if (vm.selectedTab === 1 && event.keyCode === 39) {
               navigateToNextSlide();
               $scope.$apply();
            }
        });

        angular.element($window).bind('resize', function() {
            $timeout(function() {
                setMainSlideWidthInFullScreen();
            }, 0);
        });

        /*  DIALOG CONTROLLERS
            =================================================== */
        function slideDialogController($scope, $mdDialog, slide, showBackside) {
            $scope.slide = slide;
            $scope.imageName = $scope.slide.image.substring($scope.slide.image.lastIndexOf('/') + 1);
            $scope.flipSlide = flipSlide;
            if (showBackside) {
                $timeout(function() {
                    flipSlide('DIALOG');
                });

            }
            $scope.close = function() {
                $mdDialog.hide();
            };
        }

        function addSlideDialogController($scope, $mdDialog) {
            $scope.close = function() {
                $mdDialog.hide();
            };
        }

        function openFullScreenDialogController($scope, $mdDialog) {
            $scope.sectionCtrl = vm;

            $scope.close = function() {
                $mdDialog.hide();
            };

            $timeout(function() {
                setMainSlideWidthInFullScreen();
            }, 0);

            $timeout(function() {
                if (document.querySelector('.slide-preview__slides-wrapper')) {
                    [].slice.call(document.querySelectorAll('.slide-preview__slides-wrapper')).forEach(function(slidesWrapper) {
                        centerSlideInPreviewBar($scope.sectionCtrl.activeSlideIndex, slidesWrapper);
                    });
                }
            }, 800);
        }

        /*  FUNCTIONS
            =================================================== */
        function setMainSlideWidthInFullScreen() {
            var imageWrapperElement = angular.element(document.querySelector('.sherpa-dialog--full-screen .js-slide-presentation__slide__image'));
            var windowHeight = window.innerHeight;
            var imageHeight = windowHeight - 340;
            var imageWidth = (imageHeight/9)*16;
            imageWrapperElement.css('width', imageWidth + 'px');
            positionNavButtons();

            function positionNavButtons() {
                var navButtons = document.querySelectorAll('.sherpa-dialog--full-screen .slide-presentation__navigation .md-button');
                var availableSpace = window.innerWidth - imageWidth;
                if (availableSpace > 180) { // position buttons on sides
                    angular.element(navButtons[0]).css('left', (availableSpace/2) - 115 + 'px');
                    angular.element(navButtons[0]).css('bottom', '0');
                    angular.element(navButtons[1]).css('right', (availableSpace/2) - 115 + 'px');
                    angular.element(navButtons[1]).css('bottom', '0');
                }
                else if (availableSpace >= 30) { // position buttons below
                    angular.element(navButtons[0]).css('left', (availableSpace/2) - 18 + 'px');
                    angular.element(navButtons[0]).css('bottom', '-50px');
                    angular.element(navButtons[1]).css('right', (availableSpace/2) - 18 + 'px');
                    angular.element(navButtons[1]).css('bottom', '-50px');
                }
                else { // image is restrained by max-width:100%
                    angular.element(navButtons[0]).css('left', '0');
                    angular.element(navButtons[0]).css('bottom', '-50px');
                    angular.element(navButtons[1]).css('right', '0');
                    angular.element(navButtons[1]).css('bottom', '-50px');
                }
            }
        }

        function activateSlide(newSlideIndex, centralizeInPreviewBar) {
            vm.activeSlideIndex = newSlideIndex;
            vm.activeSlide = vm.slides[newSlideIndex];
            vm.slides.forEach(function(slide) {
                slide.isActive = false;
            });
            vm.activeSlide.isActive = true;

            if (centralizeInPreviewBar && document.querySelector('.slide-preview__slides-wrapper')) {
                [].slice.call(document.querySelectorAll('.slide-preview__slides-wrapper')).forEach(function(slidesWrapper) {
                    centerSlideInPreviewBar(newSlideIndex, slidesWrapper);
                });
            }
            $rootScope.$broadcast('FLIP_BACK_EVENT_IN_MAIN');
        }

        function navigateToNextSlide() {
            if (vm.activeSlideIndex < vm.slides.length - 1) {
                var newSlideIndex = vm.activeSlideIndex + 1;
                activateSlide(newSlideIndex, true);
            }
        }

        function navigateToPrevSlide() {
            if (vm.activeSlideIndex > 0) {
                var newSlideIndex = vm.activeSlideIndex - 1;
                activateSlide(newSlideIndex, true);
            }
        }

        function moveSlidesbarToRight($event) {
            var slidesWrapperElement = angular.element($event.currentTarget.previousElementSibling);
            var slidesWrapperElementWidth = $event.currentTarget.previousElementSibling.clientWidth;
            var availableScreenWidth = $rootScope.sidenavLocked && !slidesWrapperElement.hasClass('js-in-dialog') ? window.innerWidth - 260 : window.innerWidth;
            var distanceToMove = availableScreenWidth - 190;
            var currentPositionFromLeft = parseInt(slidesWrapperElement.css('left'), 10);

            if (slidesWrapperElementWidth + currentPositionFromLeft - distanceToMove <= availableScreenWidth) {
                distanceToMove = slidesWrapperElementWidth + currentPositionFromLeft - availableScreenWidth;
            }

            slidesWrapperElement.css('left', currentPositionFromLeft - distanceToMove + 'px');
        }

        function moveSlidesbarToLeft($event) {
            var slidesWrapperElement = angular.element($event.currentTarget.nextElementSibling);
            var slidesWrapperElementWidth = $event.currentTarget.nextElementSibling.clientWidth;
            var availableScreenWidth = $rootScope.sidenavLocked && !slidesWrapperElement.hasClass('js-in-dialog') ? window.innerWidth - 260 : window.innerWidth;
            var distanceToMove = availableScreenWidth - 190;
            var currentPositionFromLeft = parseInt(slidesWrapperElement.css('left'), 10);
            if (slidesWrapperElementWidth + currentPositionFromLeft + distanceToMove >= slidesWrapperElementWidth) {
                distanceToMove = -currentPositionFromLeft;
            }

            slidesWrapperElement.css('left', currentPositionFromLeft + distanceToMove + 'px');
        }

        function centerSlideInPreviewBar(slideIndex, slidesWrapper) {
            var slidesWrapperElement = angular.element(slidesWrapper);
            var slidesWrapperElementWidth = slidesWrapper.clientWidth;
            var slideElementWidth = angular.element(slidesWrapper).children()[0].clientWidth;
            var availableScreenWidth = $rootScope.sidenavLocked && !slidesWrapperElement.hasClass('js-in-dialog') ? window.innerWidth - 260 : window.innerWidth;
            var newPositionFromLeft = -slidesWrapperElementWidth*((slideIndex)/vm.slides.length) + (availableScreenWidth/2) - (slideElementWidth/2 + 20);
            newPositionFromLeft = newPositionFromLeft > 0 ? 0 : newPositionFromLeft;
            newPositionFromLeft = newPositionFromLeft - availableScreenWidth < -slidesWrapperElementWidth ? -slidesWrapperElementWidth + availableScreenWidth : newPositionFromLeft;

            slidesWrapperElement.css('left', newPositionFromLeft + 'px');
        }

        function flipSlide(location) {
            $rootScope.$broadcast('FLIP_EVENT_IN_' + location);
        }

        function switchSlideNavigationType() {
            vm.inListTypeTransition = true;
            $timeout(function() {
                vm.slideNavigationInGrid = !vm.slideNavigationInGrid;
            }, 200)
            .then(function() {
                $timeout(function() {
                    vm.inListTypeTransition = false;
                }, 400);
            });
        }

        function switchListType() {
            vm.inListTypeTransition = true;
            $timeout(function() {
                vm.slidesInGrid = !vm.slidesInGrid;
            }, 200)
            .then(function() {
                $timeout(function() {
                    vm.inListTypeTransition = false;
                }, 400);
            });
        }

        function querySearchArticleTitle (query) {
          var results = query ? vm.autocompleteArticles.filter( createFilterForArticleTitle(query) ) : [];
          return results;
        }

        function getAutocompleteArticles() {
            return contentService.getArticles()
            .then(function(data) {
                vm.autocompleteArticles = data.slice(0,3);
                vm.autocompleteArticles.forEach(function(article) {
                    article.filterTitle = article.title.toLowerCase();
                });
                return vm.autocompleteArticles;
            });
        }

        function createFilterForArticleTitle(query) {
          var lowercaseQuery = angular.lowercase(query);
          return function filterFn(article) {
            return (article.filterTitle.indexOf(lowercaseQuery) === 0);
          };
        }

        function addSelectedAttachment(slide) {
            if (slide.attachmentChoices.selectedArticle) {
                slide.attachments.push(slide.attachmentChoices.selectedArticle);
            }
            slide.attachmentChoices.selectedArticle = null;
            slide.attachmentChoices.searchTextArticleTitle    = null;
        }

        function keyDownOnAutocompleteAttachments($event, slide) {
            if ($event.keyCode === 13) { // enter key
                var isUrl = slide.attachmentChoices.searchTextArticleTitle.indexOf('www.') > -1 || slide.attachmentChoices.searchTextArticleTitle.indexOf('http://') > -1;
                if (isUrl) {
                    slide.attachments.push({
                        title: 'Value Based Branding',
                        url: slide.attachmentChoices.searchTextArticleTitle
                    });
                    slide.attachmentChoices.selectedArticle  = null;
                    slide.attachmentChoices.searchTextArticleTitle    = null;
                }
            }
        }

        function showSlideInDialog(ev, slide, showBackside) {
            ev.stopPropagation();
            $mdDialog.show({
            controller: slideDialogController,
            locals: {
                slide: slide,
                showBackside: showBackside
            },
            templateUrl: TEMPLATES_ROOT + '/page-presentation/dialog-slide.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
            });
        }

        function getFeedTweets(numberOfTweets) {
            var tweets = [];
            var counter = 0;
            while (counter < numberOfTweets) {
                tweets.push({
                    type: 'tweet',
                    avatar: 'profile_picture.jpg',
                    name: 'SOLIDWORKS Asia Pac',
                    profileName: '@SolidWorksAPAC',
                    timestamp: '4 days ago',
                    tweet: 'Take a look behind the scenes of the SOLIDWars skit from ',
                    tweetLinks: [
                        '#SWW16',
                        'https://t.co/1CNZyRDfEa'
                    ],
                    imagePath: '',
                    checked: false
                });
                counter++;
            }
            tweets[Math.ceil(numberOfTweets/2)].imagePath = 'hub/content/articles/full/VR_Article_Full.jpg';
            return tweets;
        }

        function prependIncomingFeedItems(numberOfItems) {
            var items = getFeedTweets(numberOfItems);
            items.forEach(function(item) {
                vm.incomingFeedItems.unshift(item);
            });
        }

        function openFullScreenDialog(ev) {
            $mdDialog.show({
                controller: openFullScreenDialogController,
                templateUrl: TEMPLATES_ROOT + '/page-presentation/dialog-fullscreen-presentation.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }


        function openAddSlideDialog(ev) {
            $mdDialog.show({
                controller: addSlideDialogController,
                templateUrl: TEMPLATES_ROOT + '/page-presentation/dialog-add-slide.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        }

        function getSlides() {
            var slides = [
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.001.jpeg',
                    attachments: [
                        {
                        title: 'BBC Audience Engagement Reference',
                        url: 'http://www.bbc.co.uk/audienceengagement'
                        },
                        {
                        title: 'BBC Audience Engagement Reference',
                        url: 'http://www.bbc.co.uk/audienceengagement'
                        },
                        {
                        title: 'BBC Audience Engagement Reference',
                        url: 'http://www.bbc.co.uk/audienceengagement'
                        }
                    ],
                    isActive: true
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.002.jpeg',
                    attachments: [
                        {
                            title: 'BBC Audience Engagement Reference',
                            url: 'http://www.bbc.co.uk/audienceengagement'
                        },
                        {
                            title: 'BBC Audience Engagement Reference',
                            url: 'http://www.bbc.co.uk/audienceengagement'
                        }
                    ],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.003.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.004.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.005.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.006.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.007.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.008.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.009.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.010.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.011.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.012.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.013.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.014.jpeg',
                    attachments: [],
                    isActive: false
                },
                {
                    image: IMAGES_ROOT + '/hub/content/slides/Slides.015.jpeg',
                    attachments: [],
                    isActive: false
                }
            ];
            slides.forEach(function(slide) {
                slide.attachmentChoices = {};
                slide.attachmentChoices.autocompleteArticles        = getAutocompleteArticles();
                slide.attachmentChoices.querySearchArticleTitle   = querySearchArticleTitle;
                slide.attachmentChoices.selectedArticle  = null;
                slide.attachmentChoices.searchTextArticleTitle    = null;
            });
            return slides;
        }
      }
    ]);

angular
    .module('app')
    .controller('WidgetsSectionCtrl', [
function() {
    'use strict';

    var vm = this;

    vm.header = {
        breadcrumb: null,
        tabs: [
            {
                name: 'widgets',
                clickHandler: function(){vm.selectedTab = 1;}
            },
            {
                name: 'library',
                clickHandler: function(){vm.selectedTab = 2;}
            }
        ],
        tabsBlockOptions: [
            {
                icon: 'view_module',
                label: 'Modules',
                clickHandler: function(){},
                menu: null
            },
            {
                icon: 'filter_list',
                label: 'Filter',
                clickHandler: function(){},
                menu: {
                    canTickMultiple: false,
                    width: 3,
                    options: [
                        {
                            name: 'Option',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        }
                    ]
                }
            },
            {
                icon: 'sort_by_alpha',
                label: 'Sort',
                clickHandler: function(){},
                menu: {
                    canTickMultiple: false,
                    width: 3,
                    options: [
                        {
                            name: 'Option',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        }
                    ]
                }
            },
            {
                icon: 'search',
                label: 'Search',
                clickHandler: function(){},
                menu: null
            },
            {
                icon: 'more_vert',
                label: 'More',
                clickHandler: function(){},
                menu: {
                    canTickMultiple: false,
                    width: 3,
                    options: [
                        {
                            name: 'Share',
                            icon: 'person_add',
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Help',
                            icon: 'help',
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        }
                    ]
                }
            }
        ]
    };

    /*  FUNCTIONS
        =================================================== */
    function menuOptionClickHandler(option) {
        if(!this.icon) { // is a select menu
            if(!option.menu.canTickMultiple) {
                option.menu.options.forEach(function(menuOption) {
                    menuOption.selected = false;
                    return;
                });
            }
            this.selected = !this.selected;
        }
        else {
            return;
        }
    }
}]);

angular
    .module('app')
    .controller('dialogAssetsCtrl', ['$scope', '$document', '$mdDialog', '$timeout', '$interval', '$mdToast', 'assets',
      function($scope, $document, $mdDialog, $timeout, $interval, $mdToast, assets) {
        'use strict';

        $scope.tabs = [
            {
                name: 'assets',
                clickHandler: function(){$scope.selectedTab = 1;}
            },
            {
                name: 'upload',
                clickHandler: function(){$scope.selectedTab = 2;}
            }
        ];
        $scope.buttons = [
            {
                icon: 'view_module',
                label: 'Modules',
                clickHandler: switchListType,
                menu: null
            },
            {
                icon: 'filter_list',
                label: 'Filter',
                clickHandler: function(){},
                menu: {
                    canTickMultiple: true,
                    width: 3,
                    options: [
                        {
                            name: 'Articles',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Blog post',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Chart',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Session',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Document',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Presentation',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Infographic',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'eBook',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Report',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Case study',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Interview',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Video',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        }
                    ]
                }
            },
            {
                icon: 'sort_by_alpha',
                label: 'Sort',
                clickHandler: function(){},
                menu: {
                    canTickMultiple: false,
                    width: 4,
                    options: [
                        {
                            name: 'Last modified',
                            icon: null,
                            selected: true,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Last modified by me',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        },
                        {
                            name: 'Most popular',
                            icon: null,
                            selected: false,
                            clickHandler: menuOptionClickHandler
                        }
                    ]
                }
            },
            {
                icon: 'search',
                label: 'Search',
                clickHandler: function(){},
                menu: null
            }
        ];
        $scope.assets = assets; // local dependency
        $scope.numberOfAssetsChecked = 0;
        $scope.stickyFooter = {
            buttons: [
                {
                    icon: 'local_offer',
                    label: 'Offer',
                    clickHandler: function(){}
                },
                {
                    icon: 'file_download',
                    label: 'download',
                    clickHandler: function(){}
                },
                {
                    icon: 'delete',
                    label: 'Delete',
                    clickHandler: function(){}
                }
            ],
            action: {
                text: 'Push live',
                clickHandler: function(){
                    showActionToast();
                    $scope.addAsset();
                }
            }
        };
        $scope.openAssetPanel = openAssetPanel;

        $scope.articlesPerPage = 20;
        $scope.articlesInGrid = false;
        $scope.switchListType = switchListType;
        $scope.inListTypeTransition = false;

        $scope.addAsset = function() {
            $mdDialog.cancel();
        };
        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };

        activate();

        function activate() {
            // Watch assets being checked
            $scope.assets.forEach(function(asset) {
                $scope.$watch(function watchAssetChecked() {
                    return asset.checked;
                },
                function(newValue, oldValue) {
                    if(newValue !== oldValue){
                        $scope.numberOfAssetsChecked += newValue ? 1 : -1;
                    }
                });
            });
        }

        /*  WATCHES
            ====================================================== */

        $scope.$watch(function watchAllAssetsSelected() {
            return $scope.allAssetsSelected;
        },
        function(newValue, oldValue) {
            if(newValue !== oldValue){
                $scope.assets.forEach(function(asset) {
                    asset.checked = newValue;
                });
            }
        });

        /*  FUNCTIONS
            =================================================== */
        function openAssetPanel(asset) {
            if(asset.panel) {
                asset.panel.active = !asset.panel.active;
                asset.panel.progress = 0;

                if(asset.panel.active && asset.panel.hasProgressBar) {
                    var stop = $interval(function() {
                        if(asset.panel.progress === 100 || !asset.panel.active) {
                            $interval.cancel(stop);
                        }
                        else {
                            asset.panel.progress += 2;
                        }
                    }, 25);
                }
            }
        }

        function switchListType() {
            $scope.inListTypeTransition = true;
            $timeout(function() {
                $scope.articlesInGrid = !$scope.articlesInGrid;
            }, 200)
            .then(function() {
                $timeout(function() {
                    $scope.inListTypeTransition = false;
                }, 400);
            });
        }

        function showActionToast() {
            var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
            };
            var toast = $mdToast.simple()
                .parent($document[0].querySelector('#content'))
                .textContent('Updates pushed live.')
                .action('UNDO')
                .highlightAction(true)
                .position(getToastPosition(last))
                .hideDelay(3000);
            $mdToast.show(toast).then(function(response) {
                if ( response === 'ok' ) {
                    console.log('undo');
                }
            });

            function getToastPosition(last) {
                sanitizePosition(last);
                return Object.keys(angular.extend({},last))
                  .filter(function(pos) { return angular.extend({},last)[pos]; })
                  .join(' ');
            }

            function sanitizePosition(last) {
                var current = angular.extend({},last);
                if ( current.bottom && last.top ) {current.top  = false;}
                if ( current.top && last.bottom ) {current.bottom  = false;}
                if ( current.right && last.left ) {current.left  = false;}
                if ( current.left && last.right ) {current.right = false;}
                last = angular.extend({},current);
            }
        }

        function menuOptionClickHandler(option) {
            if(!this.icon) { // is a select menu
                if(!option.menu.canTickMultiple) {
                    option.menu.options.forEach(function(menuOption) {
                        menuOption.selected = false;
                        return;
                    });
                }
                this.selected = !this.selected;
            }
            else {
                return;
            }
        }
      }
    ]);

angular
    .module('app')
    .controller('FooterCtrl', [
function() {
    'use strict';

    var vm = this;

    vm.columns = [
        [
            'Dashboard',
            'Zones'
        ],
        [
            'LIVE',
            'Sessions'
        ],
        [
            'Content',
            'Assets',
            'Type'
        ],
        [
            'Pages',
            'Core',
            'Templates',
            'Builder'
        ],
        [
            'Widgets',
            'Library'
        ],
        [
            'Audience',
            'Groups'
        ],
        [
            'Automate',
            'Integrations'
        ],
        [
            'Settings',
            'Global',
            'Branding',
            'Access'
        ],
        [
            'Profile',
            'Messages',
            'Account',
            'Logout'
        ],
        [
            'Support',
            'Knowledge Base'
        ]
    ];

    /*  FUNCTIONS
        =================================================== */

}]);

/*  Focus on element
    ======================================================== */
angular
    .module('app')
    .directive('focusMe', function() {
        'use strict';

        return {
            scope: { trigger: '=focusMe' },
            link: function($scope, $element) {
                $scope.$watch('trigger', function() {
                    $element[0].focus();
                });
            }
        };
    });

/*  Focus child input elements on page load and ngShow event
    ======================================================== */
angular
    .module('app')
    .directive('autofocus', ['$timeout', function($timeout) {
        'use strict';

        return {
            restrict: 'A',
            link : function($scope, $element, $attrs) {
                $timeout(function() {
                    $element.find('input').focus();
                });
                $scope.$watch($attrs.ngShow, function() {
                    $timeout(function() {
                        $element.find('input').focus();
                    }, 400);
                });
            }
        };
    }]);

angular
    .module('app')
    .directive('collapsibleList', ['$window', '$timeout', function($window, $timeout) {
        'use strict';

        var classItemActive = 'collapsible-list__item--active';
        var classItemBody = 'collapsible-list__item__body';
        var classItemHeader = 'collapsible-list__item__header';
        var classBodyLoading = 'body-loading';
        var classBodyLoaded = 'body-loaded';

        var isItemLoading = function(listItemsArray) {
            for(var i = 0; i < listItemsArray.length; i++){
                if(listItemsArray[i].classList.contains(classBodyLoading)) {
                    return true;
                }
            }
            return false;
        };

        var getListItemBodyHeight = function(listItemBody) {
            var height = 0;

            var bodyNode = document.querySelector('body');
            var listItemWidth = listItemBody.parentNode.offsetWidth;
            var listItemBodyClone = listItemBody.cloneNode(true);

            listItemBodyClone.style.height = 'auto';
            listItemBodyClone.style.padding = '35px 40px'; // TODO: replace hard coded css values
            listItemBodyClone.style.width = listItemWidth - 80 + 'px';
            listItemBodyClone.style.position = 'absolute';
            listItemBodyClone.style.left = '-99999';

            bodyNode.appendChild(listItemBodyClone);
            height = listItemBodyClone.offsetHeight - 70;
            bodyNode.removeChild(listItemBodyClone);

            return height;
        };

        // collapse all list items on resize
        angular.element($window).bind('resize', function() {
            var activeListItems = document.querySelectorAll('.' + classItemActive);
            var activeListItemsArray = [].slice.call(activeListItems);
            activeListItemsArray.forEach(function(activeListItem) {
                var activeListItemBody = activeListItem.querySelector('.' + classItemBody);
                activeListItem.classList.remove(classItemActive);
                activeListItem.classList.remove(classBodyLoaded);
                activeListItem.classList.remove(classBodyLoading);
                activeListItemBody.style.height = '0';
            });
       });

        return {
            restrict: 'A',
            link : function($scope, $element) {
                var listItemsArray = [].slice.call($element.children());
                var listItemHeadersArray = listItemsArray.map(function(listItem) {
                    return listItem.querySelector('.' + classItemHeader);
                });

                listItemHeadersArray.forEach(function(listItemHeader) {
                    listItemHeader.addEventListener('click', function() {
                        if(isItemLoading(listItemsArray)) {
                            return;
                        }

                        var listItem = this.parentNode;
                        var listItemBody = listItem.querySelector('.' + classItemBody);

                        if(listItem.classList.contains(classItemActive)) {
                            listItem.classList.remove(classItemActive);
                            listItem.classList.remove(classBodyLoaded);
                            listItemBody.style.height = '0';
                        }
                        else {
                            var listItemBodyHeight = getListItemBodyHeight(listItemBody);
                            var activeListItem = listItemsArray.filter(function(listItem) {
                                return listItem.classList.contains(classItemActive);
                            })[0];

                            if(activeListItem) { // collapse previous active item
                                activeListItem.classList.remove(classItemActive);
                                activeListItem.classList.remove(classBodyLoaded);
                                activeListItem.querySelector('.' + classItemBody).style.height = '0';
                            }

                            listItem.classList.add(classItemActive);
                            listItem.classList.add(classBodyLoading);
                            $timeout(function() { // async content loading
                                listItem.classList.remove(classBodyLoading);
                                listItem.classList.add(classBodyLoaded);
                                listItemBody.style.height = listItemBodyHeight  + 'px';
                            }, 2000);
                        }
                    });
                });
            }
        };
    }]);
