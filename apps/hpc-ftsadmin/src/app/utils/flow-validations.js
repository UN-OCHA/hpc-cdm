// Create the HPC object if it doesn't exist. This ensures
// our validations are within scope and don't conflict with
// potential other objects. (eg. ng-flow's Flow object).
var HPC = HPC || {};
var angular = angular || undefined;
// var moment = moment || require('moment');

(function (HPC) {
  'use strict';
  // A validation library.

  // Here we create the promise library that will hopefully
  // work with both $q and bluebird's promise.
  let Promise;
  let $http;
  let serviceUrl;
  let serviceParams;
  let AuthorizationService;

  // This is questionable, but we're only using it for the forEach.
  const _ = angular || require('lodash');

  function setServiceParams() {
    return new Promise(function (resolve) {
      // eslint-disable-next-line no-undef
      angular.element(document).ready(function () {
        // eslint-disable-next-line no-undef
        const injector = angular.element(document.body).injector();
        if (injector) {
          AuthorizationService = injector.get('AuthorizationService');
          serviceParams = {
            access_token: AuthorizationService.getAccessToken(),
          };
        }

        resolve();
      });
    });
  }

  /** Intl library */
  function formatCurrency(number) {
    const fixedNumber = number.toFixed(2);
    const [integerPart, fractionalPart] = fixedNumber.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedCurrency = '$' + formattedInteger + '.' + fractionalPart;
    return formattedCurrency;
  }

  /** moment library */
  function parseDate(dateString) {
    if (dateString) {
      const dateParts = dateString.split('/');
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      return new Date(Date.UTC(year, month, day));
    }
    return null;
  }

  if (angular) {
    // Bootstrapping the things we need from Angular to be able to
    // access the API. This code only runs on the client.
    Promise = angular.injector(['ng']).get('$q');
    $http = angular.injector(['ng']).get('$http');

    setServiceParams().then(function () {
      serviceUrl =
        // eslint-disable-next-line no-undef
        `${window.appConfig.serviceBaseUrl}/${window.appConfig.serviceVersion}`;
    });
  } else {
    Promise = require('bluebird');
    // eslint-disable-next-line no-global-assign
    // Intl = require('intl');
  }

  /*
   * A constructor for a Flow validator.
   * Works on the client, will work on the server as well.
   * When on the client, pass in the AutocompleteService to make
   * fetching flow information easier.
   *
   * returns an object which has a validate() method which will
   * return a promise when completed.
   */
  HPC.Flow = function (flowObj, options, windowAlt) {
    // Set the window if it isn't defined. Window contains the "confirm" function.
    // On the front-end we don't supply this because window is already defined.
    windowAlt = windowAlt || {};

    const self = flowObj;

    const object = {
      options: options || {},
      self: flowObj,
      // Fields are the fields that are on the object that
      // can be manipulated.
      fields: {
        id: {
          type: 'INTEGER',
        },
        versionID: {
          type: 'INTEGER',
        },
        amountUSD: {
          type: 'BIGINT',
          allowNull: false,
          validate: {
            isInt: true,
          },
          substantive: true,
        },
        flowDate: {
          type: 'DATE',
        },
        decisionDate: {
          type: 'DATE',
          substantive: true,
        },
        firstReportedDate: {
          type: 'DATE',
        },
        budgetYear: {
          type: 'STRING',
        },
        origAmount: {
          type: 'BIGINT',
          validate: {
            isInt: true,
          },
          substantive: true,
        },
        origCurrency: {
          type: 'STRING',
          validate: {
            isAlpha: true,
          },
          substantive: true,
        },
        exchangeRate: {
          type: 'DECIMAL',
          validate: {
            isFloat: true,
          },
          substantive: true,
        },
        activeStatus: {
          type: 'BOOLEAN',
          allowNull: false,
        },
        restricted: {
          type: 'BOOLEAN',
          allowNull: false,
        },
        description: {
          type: 'TEXT',
        },
        notes: {
          type: 'TEXT',
        },
        versionStartDate: {
          type: 'DATE',
        },
        versionEndDate: {
          type: 'DATE',
        },
      },
      // Elements are things associated with a flow that aren't
      // part of the fields actually stored on the flow
      elements: {
        flowStatuses: {
          substantive: true,
        },
        flowObjects: {
          substantive: true,
        },
      },
      // Validations are what get validated in
      // .validate();
      validations: [
        checkFundingAmountGreaterThanZero,
        checkContributionStatusDate,
        checkKeywordEntryForCERF,
      ],
      // These functions generally require some form
      // of user input to complete. They're run before
      // validations to make sure the user didn't accidentally
      // forget anything.
      // TODO: because these checks all use `confirm` they
      // can at the moment only be run on the front-end.
      preValidations: [
        checkForSubstantiveChanges,
        checkFundingAmountOfParents,
        checkFundingAmountOfChildren,
        checkLocationsForAPlan,
        checkLocationsForAnEmergency,
        checkReportDate,
        checkForEmergency,
        checkIfEmergencyRestricted,
        checkReportDetails,
        checkEarmarking,
        checkChildFlowParkedParentHasTheSameForeignCurrency,
        checkMultiYearKeyword,
      ],
      // The function that gets called to validate
      // the object.
      validate: validate,
      // The function that can be called to prompt for user
      // feedback on how to complete the flow object.
      preValidate: preValidate,
      // These are private, but we need to make them available
      // for testing purposes. Possibly a way around this?
      _: {
        _fetchFlow: _fetchFlow,
        _fetchPlan: _fetchPlan,
        _fetchEmergency: _fetchEmergency,
        _fetchEmergencies: _fetchEmergencies,
      },
    };

    return object;

    /*
     * This is the meat of this library. Calling .validate()
     * will loop through the pre-defined validations in the object's
     * validations, as well as whatever validations were added
     * to the object afterwards.
     *
     * It returns a promise that resolves with the success
     * results, or rejects with the errors array.
     */
    function validate(validationsArrayName) {
      validationsArrayName = validationsArrayName || 'validations';
      const checksToRun = object[validationsArrayName];

      return new Promise(function (resolve, reject) {
        return serial(checksToRun)
          .then(function (results) {
            const errors = results.filter(function (r) {
              if (r) {
                return !r.success;
              }
            });
            console.log(errors);
            if (errors.length === 0) {
              resolve(results);
            } else {
              reject(errors);
            }
          })
          .catch(function (err) {
            console.log(err);
            // reject([err]);
          });
      });
    }

    function preValidate() {
      return validate('preValidations');
    }

    /**
     * Add validation when approving a pending flow, or saving a regular flow,
     * to check for the following condition:
     *   * Funding Amount in USD = 0 AND Funding Amount (original currency) > 0
     * When the condition is true, prevent the flow from being approved or
     * saving (as applicable) and display the following message: "Funding
     * Amount in USD must be greater than 0."
     *
     */
    function checkFundingAmountGreaterThanZero() {
      const checkedStr = 'flow:funding-amount';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        if (+self.amountUSD === 0 && +self.origAmount > 0) {
          return reject({
            success: false,
            checked: checkedStr,
            message:
              'This flow has a foreign currency value, but the USD value ' +
              'is 0. Please update the USD value accordingly.',
          });
        }
        return resolve(successObj);
      });
    }

    /**
     * When a Child funding flow is saved: Check if the Funding Amount in USD on
     * this flow, plus the Funding Amount in USD on all other flows that have
     * this child flow's same immediate parent flow, is greater than the Funding
     * Amount in USD on the parent flow. If true, display this confirmation message:
     * "Please note, this flow's parent amount (<total flow parent amount in USD>)
     * is less than the sum of its children's amount (<total funding amount in
     * USD for child flows>). Do you want to proceed?"
     *
     * @returns {Promise}
     */
    function checkFundingAmountOfParents() {
      return new Promise(function (resolve, reject) {
        const checkedStr = 'flow:parent:amount';
        const promiseArray = [];

        // const formatter = new Intl.NumberFormat('en-US', {
        //   style: 'currency',
        //   currency: 'USD',
        //   minimumFractionDigits: 2,
        // });

        if (self.parents) {
          self.parents.forEach(function (parent) {
            if (parent) {
              promiseArray.push(object._._fetchFlow(parent.id));
            }
          });
        }

        return Promise.all(promiseArray).then(function (fetchedParents) {
          let totalParents = 0;
          let totalChildren = 0;

          const tooLargeFlows = fetchedParents.filter(function (parent) {
            const parentAmount = +parent.amountUSD;
            let childrenAmount = 0;

            // We keep track of the childIDs to see if the current flow, which
            // is the child of the parent, is already in the children array of
            // the parent. This could be missed if a parent gets newly linked
            // to a child - the child won't yet be stored in the parent's array.
            const childIDs = [];

            parent.children.forEach(function (child) {
              // If activestatus is false, it means that the flowLink exists
              // but that the Child itself is actually still pending,
              // so it doesn't get attached to the flowLink.
              if (child.activeStatus) {
                // Make sure that we count the new value.
                if (self && child.id === self.id) {
                  childrenAmount += +self.amountUSD;
                } else {
                  childrenAmount += +child.amountUSD;
                }
                childIDs.push(child.childID);
              }
            });

            // Take into account that the childID might not yet be
            // a part of the parent children array.
            if (childIDs.indexOf(self.id) === -1) {
              childrenAmount += +self.amountUSD;
            }

            totalChildren += childrenAmount;
            totalParents += parentAmount;

            return childrenAmount > parentAmount;
          });

          if (tooLargeFlows.length > 0) {
            const message =
              `Please note, this flow's parent amount (${formatCurrency(
                totalParents
              )}) is less than the sum of its ` +
              `children's amount (${formatCurrency(totalChildren)}). ` +
              `Do you want to proceed?`;
            const confirmed = windowAlt.confirm(message);
            if (confirmed) {
              resolve({
                success: true,
                checked: checkedStr,
              });
            } else {
              reject({
                success: false,
                checked: checkedStr,
                message: message,
              });
            }
          } else {
            resolve({
              success: true,
              checked: checkedStr,
            });
          }
        });
      });
    }

    /**
     * When a Parent funding flow is saved: Check if the Funding Amount in USD
     * on this flow is less than the sum of the Funding Amount in USD values for
     * all immediate child flows. If true, display this message: "The Funding
     * Amount on this parent flow (<parent flow Funding Amount in USD>) is less
     * than the total of the Funding Amounts on the linked child flows (<total
     * Funding Amount in USD for child flows>). The Funding Amount on this
     * parent flow must be greater than or equal to the total of the Funding
     * Amounts on the linked child flows."
     *
     * @returns {Promise}
     */
    function checkFundingAmountOfChildren() {
      const checkedStr = 'flow:children:amount';
      const successObj = _buildSuccessObj(checkedStr);
      const deferred = new Promise.defer();

      const selfAmount = self.amountUSD;
      let childrenAmount = 0;

      // const formatter = new Intl.NumberFormat('en-US', {
      //   style: 'currency',
      //   currency: 'USD',
      //   minimumFractionDigits: 2,
      // });

      if (self.children) {
        self.children.forEach(function (child) {
          // If child.Child is null, it means that the flowLink exists
          // but that the Child itself is actually still pending,
          // so it doesn't get attached to the flowLink.
          if (child) {
            childrenAmount += +child.amountUSD;
          }
        });
      }

      if (+childrenAmount > +selfAmount) {
        const message =
          `Please note, the Funding Amount on this parent flow (${formatCurrency(
            selfAmount
          )}) is less than the sum of its ` +
          `children's amount (${formatCurrency(childrenAmount)}). ` +
          `Do you want to proceed?`;
        const confirmed = windowAlt.confirm(message);
        if (confirmed) {
          deferred.resolve(successObj);
        } else {
          deferred.reject({
            success: false,
            checked: checkedStr,
            message: message,
          });
        }
      } else {
        deferred.resolve(successObj);
      }

      return deferred.promise;
    }
    /**
     * In a child flow, if a parked parent is added and the parked parent has a foreign currency
     * on save of child flow check that the child's foreign currency matches the parent's currency
     * If no match, display error message "This flow's foreign currency must be the same as it's parked parent flow."
     * In a parent parked flow, if it has a foreign currency and if a child flow is added
     * the child's foreign currency field must match the parent's foreign currency
     * If no match, then on click of  add child flow, display a message
     * "The child flow must have the same currency as this parked flow.  Please update the child flow first before linking it to this flow"
     *
     * @returns {Promise}
     */
    function checkChildFlowParkedParentHasTheSameForeignCurrency() {
      const checkedStr = 'flow:funding-amount';
      const successObj = _buildSuccessObj(checkedStr);
      return new Promise(function (resolve, reject) {
        const parentCurrencyIsValid = self.parents.filter(
          (parent) => parent.origCurrency !== self.origCurrency
        );
        const childrenCurrencyIsValid = self.children.filter(
          (children) => children.origCurrency !== self.origCurrency
        );
        if (parentCurrencyIsValid.length > 0) {
          reject({
            success: false,
            checked: checkedStr,
            message:
              "This flow's foreign currency must be the same as it's parked parent flow.",
          });
        } else if (childrenCurrencyIsValid.length > 0) {
          reject({
            success: false,
            checked: checkedStr,
            message:
              'The child flow must have the same currency as this parked flow.Please update the child flow first before linking it to this flow.',
          });
        } else {
          return resolve(successObj);
        }
      });
    }

    /**
     * TODO: write docs
     *
     */
    function checkReportDate() {
      const checkedStr = 'flow:reportDate:equal';

      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        if (object.options.adding) {
          const reportDate = self.reportDetails[0].date;

          let momentFirstDetail = parseDate(self.reportDetails[0].date);
          let momentFirstReportDate = parseDate(self.firstReportedDate);

          if (!momentFirstDetail) {
            momentFirstDetail = parseDate(self.firstReportedDate);
          }
          if (!momentFirstReportDate) {
            momentFirstReportDate = parseDate(reportDate);
          }

          if (
            momentFirstDetail &&
            momentFirstReportDate &&
            momentFirstDetail.getTime() === momentFirstReportDate.getTime()
          ) {
            resolve(successObj);
          } else {
            const confirmed = windowAlt.confirm(
              "Your flow's reported date and first reported " +
                'details date are different. Is that OK?'
            );

            if (confirmed) {
              resolve(successObj);
            } else {
              reject({
                success: false,
                checked: checkedStr,
                message: 'Fix Report Details date.',
              });
            }
          }
        } else {
          resolve(successObj);
        }
      });
    }

    /**
     * Make sure flow contribution status and date are changed if contribution
     * status is changed.
     */
    function checkContributionStatusDate() {
      const checkedStr = 'flow:children:amount';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        // We don't care about this for new flows.
        if (object.options.adding) {
          resolve(successObj);
        } else {
          const oldFlow = object.options.originalFlow;
          if (
            object.substantiveChanges &&
            object.substantiveChanges.indexOf('flowStatus') > -1
          ) {
            if (
              self.flowDate ===
              _castStringToMomentGeneratedString(oldFlow.flowDate)
            ) {
              reject({
                success: false,
                checked: checkedStr,
                message:
                  'Contribution status has been changed. Update the Flow ' +
                  'date to the effective date for the new Contribution status.',
              });
            } else {
              resolve(successObj);
            }
          } else {
            resolve(successObj);
          }
        }
      });
    }

    /**
     * When Central Emergency Response Fund (CERF) is assigned as a Source
     * Organization AND neither "Rapid Response" or "Underfunded" is assigned as
     * a keyword OR both "Rapid Response" and "Underfunded" are assigned as keywords,
     * do not allow the flow to be saved or approved (as applicable) and display this
     * message: "Allocations from CERF must have either "Rapid Response" or "Underfunded"
     * specified as a keyword."
     *
     */
    function checkKeywordEntryForCERF() {
      const checkedStr = 'flow:keywords:correct';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        let hasCERFAsSource = false;
        // TODO: remove reliance on `src` and `dest` in this file.
        // The API doesn't use this data so it's unreliable.
        if (self.src && self.src.organization) {
          hasCERFAsSource = self.src.organization.some(function (org) {
            if (org.name === 'Central Emergency Response Fund') {
              return true;
            }
          });
        }

        if (hasCERFAsSource) {
          let found = 0;

          if (self.keywords) {
            self.keywords.forEach(function (keyword) {
              if (
                keyword.name.toLowerCase() === 'underfunded' ||
                keyword.name.toLowerCase() === 'rapid response'
              ) {
                found += 1;
              }
            });
          }

          if (found !== 1) {
            reject({
              success: false,
              checked: checkedStr,
              message:
                'Allocations from CERF must have either "Rapid response" ' +
                'or "Underfunded" specified as a keyword (and can\'t have both).',
            });
          } else {
            resolve(successObj);
          }
        } else {
          resolve(successObj);
        }
      });
    }

    function checkIfHas(self, direction, objectType) {
      return (
        !self[direction][objectType] || !self[direction][objectType].length
      );
    }

    /**
     * On save, if no countries are selected on the flow, then an alert
     * message should pop up to remind the user they need to select a
     * location in case of single-country emergency, or warn them of saving
     * without locations in case of multi-country emergency.
     */
    function checkLocationsForAnEmergency() {
      const checkedStr = 'flow:plan:locations';
      const successObj = _buildSuccessObj(checkedStr);
      return new Promise(function (resolve, reject) {
        const hasNoLocation = checkIfHas(self, 'dest', 'location');

        if (
          self.dest.emergency &&
          self.dest.emergency.length > 0 &&
          hasNoLocation
        ) {
          const emergencyPromises = self.dest.emergency.map(
            function (emergency) {
              return object._._fetchEmergency(emergency.id);
            }
          );

          Promise.all(emergencyPromises).then(function (emergencies) {
            const countries = _parseObjectsForLocations(emergencies);
            const countryNames = countries.map(function (loc) {
              return loc.name;
            });

            if (countries.length === 1) {
              const confirmed = windowAlt.confirm(
                `You have not selected the country of an emergency for this flow: ${countryNames[0]}. Press "ok" to add this country and save or "cancel" to return to edit flow.`
              );

              if (confirmed) {
                _mergeCountriesOnFlow(self, countries);
                resolve(successObj);
              } else {
                reject({
                  success: false,
                  checked: checkedStr,
                  message: 'Please add missing plan locations.',
                });
              }
            } else if (countries.length > 1) {
              const confirmed = windowAlt.confirm(
                `You have selected an ` +
                  `emergency spanning multiple countries but have not ` +
                  `selected any countries for this flow: ${countryNames.join(
                    ', '
                  )}. Press “ok” to save this flow without any country, ` +
                  `or “cancel” to return to edit flow.`
              );

              if (confirmed) {
                resolve(successObj);
              } else {
                reject({
                  success: false,
                  checked: checkedStr,
                  message: 'Please add the missing emergency locations.',
                });
              }
            } else {
              resolve(successObj);
            }
          });
        } else {
          resolve(successObj);
        }
      });
    }

    /**
     * On save, if no countries are selected on the flow, then an alert
     * message should pop up to remind the user they need to select a
     * location in case of single-country plan, or warn them of saving
     * without locations in case of multi-country plan.
     */
    function checkLocationsForAPlan() {
      const checkedStr = 'flow:plan:locations';
      const successObj = _buildSuccessObj(checkedStr);
      return new Promise(function (resolve, reject) {
        if (
          self.dest.plan &&
          self.dest.plan.length > 0 &&
          checkIfHas(self, 'dest', 'location')
        ) {
          const planPromises = self.dest.plan.map(function (plan) {
            return object._._fetchPlan(plan.id);
          });

          Promise.all(planPromises).then(function (plans) {
            const countries = _parseObjectsForLocations(plans);

            const countryNames = countries.map(function (loc) {
              return loc.name;
            });

            if (countries.length === 1) {
              const confirmed = windowAlt.confirm(
                `You have not selected the plan’s country for this flow: ${countryNames[0]}. Press "ok" to add this country and save or "cancel" to return to edit flow.`
              );

              if (confirmed) {
                _mergeCountriesOnFlow(self, countries);
                resolve(successObj);
              } else {
                reject({
                  success: false,
                  checked: checkedStr,
                  message: 'Please add missing plan locations.',
                });
              }
            } else if (countries.length > 1) {
              const confirmed = windowAlt.confirm(
                `You have not selected any of the plan’s countries for this flow: ${countryNames.join(
                  ', '
                )}. Press “ok” to save this flow without any country, or “cancel” to return to edit flow`
              );

              if (confirmed) {
                resolve(successObj);
              } else {
                reject({
                  success: false,
                  checked: checkedStr,
                  message: 'Please add missing plan locations.',
                });
              }
            } else {
              resolve(successObj);
            }
          });
        } else {
          resolve(successObj);
        }
      });
    }

    /**
     * TODO: write documentation
     */
    function checkForEmergency() {
      const checkedStr = 'flow:emergency:ensure-exists';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        if (
          self.dest.location &&
          self.dest.usageYear &&
          self.dest.location.length > 0 &&
          self.dest.usageYear.length > 0 &&
          (!self.dest.emergency || self.dest.emergency.length === 0)
        ) {
          const selfLocations = self.dest.location.map(function (l) {
            return l.name;
          });
          const selfYears = self.dest.usageYear.map(function (y) {
            return +y.year;
          });

          // TODO: can these emergency results be slimmed down? That will probably
          // require looking at hpc_service. At the moment this fetches all emergencies
          // from the server.
          object._._fetchEmergencies().then(function (emergencies) {
            let neverResolved = true;
            emergencies.forEach(function (emergency) {
              const eLocations = emergency.locations.map(function (l) {
                return l.name;
              });
              const eYear = parseDate(emergency.date).year();

              const overlapLocations = selfLocations.filter(function (sL) {
                return eLocations.indexOf(sL) > -1;
              });

              if (
                selfYears.indexOf(eYear) > -1 &&
                emergency.locations &&
                emergency.locations.length > 0 &&
                overlapLocations.length > 0
              ) {
                const confirmed = windowAlt.confirm(
                  `No emergency has been specified for ` +
                    `this flow, but a related emergency ${emergency.name} is available for the` +
                    ` selected destination country and year.` +
                    ` Please confirm that you want to proceed ` +
                    `to save this record without an emergency. ` +
                    `Otherwise click cancel to edit the record ` +
                    `and then click save again.`
                );
                if (confirmed) {
                  neverResolved = false;
                  resolve(successObj);
                } else {
                  neverResolved = false;
                  reject({
                    success: false,
                    checked: checkedStr,
                    message: 'Please add the missing emergency.',
                  });
                }
              }
            });

            if (neverResolved) {
              resolve(successObj);
            }
          });
        } else {
          resolve(successObj);
        }
      });
    }

    /**
     * On save of a flow that is linked to an emergency or appeal, logic needs
     * to check for the "restricted indicator" of an emergency or appeal. If
     * any of them are true, display a message to user to alert them that the
     * flow will still be visible in certain searches, even though the
     * emergency or appeal is hidden
     *
     * @returns {Promise}
     */
    function checkIfEmergencyRestricted() {
      const checkedStr = 'flow:emergency:ensure-exists';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        let restrictedEmergencies;
        let restrictedPlans;

        if (self.dest.emergency && self.dest.emergency.length) {
          restrictedEmergencies = self.dest.emergency.filter(function (e) {
            return e.restricted;
          });
        }
        if (self.dest.plan && self.dest.plan.length) {
          restrictedPlans = self.dest.plan.filter(function (p) {
            return p.restricted;
          });
        }
        if (
          (restrictedEmergencies && restrictedEmergencies.length > 0) ||
          (restrictedPlans && restrictedPlans.length > 0)
        ) {
          const confirmed = windowAlt.confirm(
            'This flow is linked to a restricted emergency/plan. ' +
              'However please note that this flow will still ' +
              'be visible in the website unless the flow ' +
              'is set to restricted too.'
          );
          if (confirmed) {
            resolve(successObj);
          } else {
            reject({
              success: false,
              checked: checkedStr,
              message:
                'Please link an emergency or plan that is not restricted, or ' +
                'fix the restriction on the emergency.',
            });
          }
        } else {
          resolve(successObj);
        }
      });
    }

    /**
     * Parse each field and element of the flow to see if there have
     * been substantive changes.
     *
     * @returns {Promise}
     */
    function checkForSubstantiveChanges() {
      const checkedStr = 'flow:substantive-changes';
      const successObj = _buildSuccessObj(checkedStr);

      const oldFlow = object.options.originalFlow;

      let substantiveChanges = [];

      function detectSubstantiveChangesInNormalFields(oldFlow, self) {
        const substantiveChanges = [];

        _.forEach(object.fields, function (fieldValue, field) {
          if (fieldValue.substantive) {
            let oldFieldValue = oldFlow[field];
            let newFieldValue = self[field];

            // Retrieved from the database the date is likely in extended
            // format, which doesn't compare well. We check for angular to
            // see if we're on the server or not - possibly a better way is
            // achievable?
            if (
              fieldValue.type === 'DATE' &&
              !(newFieldValue === null && oldFieldValue === null)
            ) {
              oldFieldValue = _castStringToMomentGeneratedString(oldFieldValue);
              newFieldValue = _castStringToMomentGeneratedString(newFieldValue);
            }

            if (
              JSON.stringify(oldFieldValue) !== JSON.stringify(newFieldValue) &&
              newFieldValue !== 'null' &&
              oldFieldValue !== 'null'
            ) {
              substantiveChanges.push(field);
            }
          }
        });

        return substantiveChanges;
      }

      function detectSubstantiveChangesInFlowObjects(self, oldFlow) {
        const substantiveChanges = [];

        let differentFlowObjects = [];

        function findMissingInArray(holder, comparator) {
          return holder.filter(function (sFO) {
            let foundSomething = false;
            comparator.forEach(function (oFO) {
              if (
                oFO.objectID === sFO.objectID &&
                oFO.objectType === sFO.objectType &&
                oFO.refDirection === sFO.refDirection
              ) {
                foundSomething = true;
              }
            });
            return !foundSomething;
          });
        }

        if (self.flowObjects) {
          // First look inside the self flowObjects to detect if any of the
          // oldFlow flowObjects are missing from it
          differentFlowObjects = findMissingInArray(
            self.flowObjects,
            oldFlow.flowObjects
          );

          // Then look inside oldFlow flowObjects to see if any of the self
          // flowObjects are missing from it. This is to detect that things
          // have been removed, which a simple check up above won't do.
          differentFlowObjects = differentFlowObjects.concat(
            findMissingInArray(oldFlow.flowObjects, self.flowObjects)
          );
        }

        differentFlowObjects.forEach(function (dFO) {
          if (substantiveChanges.indexOf(dFO.refDirection) === -1) {
            substantiveChanges.push(dFO.refDirection);
          }
        });

        return substantiveChanges;
      }

      function detectSubstantiveChangesInCategories(self, oldFlow, object) {
        const substantiveChanges = [];
        // `flowStatusCategories` is a list of category IDs passed to it
        // that are the IDs for the categories that correspond to the
        // flowStatus group. If these categories are passed, we can
        // check against the categories stored on the flow.
        if (self.flowStatuses && !object.options.flowStatusCategories) {
          delete self.flowStatuses.$$hashKey;

          if (
            JSON.stringify(self.flowStatuses) !==
            JSON.stringify(oldFlow.flowStatuses)
          ) {
            substantiveChanges.push('flowStatus');
          }
        } else if (object.options.flowStatusCategories) {
          // Find the category in the old flow that is one of flowStatusCategories
          const oldFlowStatuses = oldFlow.categories.filter(function (c) {
            return object.options.flowStatusCategories.indexOf(c) > -1;
          });
          // Find the category in the new flow that is one of flowStatusCategories
          const newFlowStatuses = self.categories.filter(function (c) {
            return object.options.flowStatusCategories.indexOf(c) > -1;
          });
          // If the category is different, its a substantive change.
          if (oldFlowStatuses[0] !== newFlowStatuses[0]) {
            substantiveChanges.push('flowStatus');
          }
        }

        return substantiveChanges;
      }

      function sendConfirmAndResolveAccordingly(resolve, reject, successObj) {
        const confirmed = windowAlt.confirm(
          `Changes have been made to the following ` +
            `significant flow data: ${substantiveChanges.join(
              ', '
            )}. Are you sure you want to record this as ` +
            `an error correction? A new version of the flow ` +
            `will not be created if these changes are recorded ` +
            `as an error correction. Click OK to continue.`
        );
        if (!confirmed) {
          reject({
            success: false,
            checked: checkedStr,
            message: 'Mark this flow as an update.',
          });
        } else {
          resolve(successObj);
        }
      }

      return new Promise(function (resolve, reject) {
        if (object.options.adding) {
          // We don't care about new objects.
          resolve(successObj);
        } else {
          substantiveChanges = substantiveChanges.concat(
            detectSubstantiveChangesInNormalFields(oldFlow, self)
          );

          substantiveChanges = substantiveChanges.concat(
            detectSubstantiveChangesInFlowObjects(self, oldFlow)
          );

          substantiveChanges = substantiveChanges.concat(
            detectSubstantiveChangesInCategories(self, oldFlow, object)
          );

          object.substantiveChanges = substantiveChanges;

          // If there is no confirm option, we need to tell
          // the calling function that there were substantive changes
          // but we don't necessarily want to reject them.
          successObj.extra = substantiveChanges;

          // If it is an error correction
          if (self.isErrorCorrection) {
            // If there are substantive changes
            if (
              object.substantiveChanges &&
              object.substantiveChanges.length > 0 &&
              // If we're approving the flow we don't need to say it
              // was an error correction.
              !self.isApprovedFlowVersion
            ) {
              // Hold off on save and confirm it's an error correction.
              if (windowAlt.confirm) {
                // Confirm is only defined on the client.
                sendConfirmAndResolveAccordingly(resolve, reject, successObj);
              } else {
                // If there is no confirm implemented, we need to tell the
                // calling function that substantive changes are present.
                resolve(successObj);
              }
              // Else just resolve and continue.
            } else {
              resolve(successObj);
            }
            // Else it is an update
          } else if (
            // Check that it has a new reportDetails
            self.reportDetails &&
            oldFlow.reportDetails &&
            self.reportDetails.length <= oldFlow.reportDetails.length
          ) {
            reject({
              success: false,
              message:
                "Changes that aren't an error correction require new Reporting Details.",
              checked: checkedStr,
            });
            // If it does have a new reportDetails, resolve successfully.
          } else if (
            object.substantiveChanges &&
            object.substantiveChanges.length > 0
          ) {
            resolve(successObj);
          } else {
            resolve(successObj);
          }
        }
      });
    }

    /**
     * Validates that the flow has been given an earmarking value
     * @returns {Promise}
     */
    function checkEarmarking() {
      const checkedStr = 'flow:earmarking';

      const successObj = _buildSuccessObj(checkedStr);

      return new Promise((resolve, reject) => {
        if (
          self.earmarking ||
          windowAlt.confirm(
            'Earmarking value is blank, do you still want to save?'
          )
        ) {
          resolve(successObj);
        } else {
          reject({
            success: false,
            checked: checkedStr,
            message: 'Please select an earmarking value.',
          });
        }
      });
    }

    /**
     * Each primary report detail should be from either a source or destination
     * on the current flow, or from a parked parent's sources.
     *
     * @returns {Promise}
     */
    function checkReportDetails() {
      const checkedStr = 'flow:report-details:valid';
      const successObj = _buildSuccessObj(checkedStr);

      return new Promise(function (resolve, reject) {
        let failed = false;
        self.reportDetails.forEach(function (detail, idx) {
          if (
            !detail.isEmpty &&
            detail.source === 'Primary' &&
            detail.organization &&
            !detail.sourceID
          ) {
            let matches = [];
            // TODO: remove reliance on `src` and `dest` in this file.
            // The API doesn't use this data so it's unreliable.
            matches = matches.concat(findOrgMatches(self, detail, 'src'));
            matches = matches.concat(findOrgMatches(self, detail, 'dest'));

            // Check inside of parked parents.
            self.parents.forEach(function (parent) {
              // `parent.Parent.categories` get set on the parent when we fetch
              // more information for the parent flow, which gets done in the
              // flow-links directive through an AJAX call to the API.
              // This means that on initial load of the page, this check will fail
              // because we don't actually have the parent categories yet.

              if (
                parent.categories &&
                parent.categories.some(function (c) {
                  return c.group === 'flowType' && c.name === 'Parked';
                })
              ) {
                // TODO: remove reliance on `src` and `dest` in this file.
                // The API doesn't use this data so it's unreliable.
                parent.src = { organization: parent.organizations };
                matches = matches.concat(findOrgMatches(parent, detail, 'src'));
              }
            });

            const foundMatch =
              matches.length &&
              matches[0] &&
              Object.prototype.hasOwnProperty.call(matches[0], 'id');

            if (!foundMatch) {
              failed = idx;
            }
          }
        });

        if (failed === false) {
          resolve(successObj);
        } else {
          const confirmed = windowAlt.confirm(
            "Your flow's Report Detail organization doesn't " +
              'match the source or destination organization ' +
              ' or that of its parked parent. Are you sure ' +
              'this is right?'
          );
          if (confirmed) {
            resolve(successObj);
          } else {
            reject({
              success: false,
              checked: checkedStr,
              message:
                `Please make sure Report Detail ${failed + 1} matches ` +
                `a source or destination organization, or that its ` +
                `parked parent sources match.`,
            });
          }
        }
      });

      // TODO: remove reliance on `src` and `dest` in this file.
      // The API doesn't use this data so it's unreliable.
      function findOrgMatches(flow, detail, target) {
        if (
          flow[target] &&
          Object.prototype.hasOwnProperty.call(flow[target], 'organization') &&
          flow[target].organization
        ) {
          return flow[target].organization.filter(function (org) {
            return org.id === detail.organization.id;
          });
        }
        return [];
      }
    }

    /*
     * If the 'Multiyear' keyword is present but NumOfYears(DestYear)<=1 AND NumOfYears(SourceYear)<=1,
     * says 'You have specified the 'Multiyear' tag even though neither the flow's source nor its destination has multiple years. Are you sure this is right?' OK/Cancel
     * Else if the 'Multiyear' keyword is absent but NumOfYears(DestYear)>1 OR NumOfYears(SourceYear)>1,
     * says 'You have not specified the 'Multiyear' tag even though the flow's source and/or destination has multiple years. Are you sure this is right?' OK/Cancel
     */

    function checkMultiYearKeyword() {
      const checkedStr = 'flow:keywrord:multiyear';

      const successObj = _buildSuccessObj(checkedStr);

      return new Promise((resolve, reject) => {
        const isMultiDestYears =
          self.dest.usageYear && self.dest.usageYear.length > 1;
        const isMultiSrcYears =
          self.src.usageYear && self.src.usageYear.length > 1;
        const isMultiYearTag = self.keywords.some(function (keyword) {
          return keyword.group === 'keywords' && keyword.name === 'Multiyear';
        });

        const error = {
          success: false,
          checked: checkedStr,
          message: 'Please check keyword, especially multi-year tag.',
        };

        if (isMultiYearTag && !isMultiDestYears && !isMultiSrcYears) {
          if (
            windowAlt.confirm(
              "You have specified the 'Multiyear' tag even though neither the " +
                "flow's source nor its destination has multiple years. " +
                'Are you sure this is right?'
            )
          ) {
            resolve(successObj);
          } else {
            reject(error);
          }
        } else if (!isMultiYearTag && (isMultiDestYears || isMultiSrcYears)) {
          if (
            windowAlt.confirm(
              "You have not specified the 'Multiyear' tag even though the " +
                "flow's source and/or destination has multiple years. " +
                'Are you sure this is right?'
            )
          ) {
            resolve(successObj);
          } else {
            reject(error);
          }
        } else {
          resolve(successObj);
        }
      });
    }

    /* Utility and Private Functions */

    function _parseObjectsForLocations(objects) {
      let countries = [];
      for (const obj of objects) {
        countries = countries.concat(obj.locations);
      }

      return countries;
    }

    function _mergeCountriesOnFlow(flow, countries) {
      if (!flow.dest.location || !flow.dest.location.length) {
        flow.dest.location = [];
      }

      countries.forEach(function (country) {
        const exists = flow.dest.location.some(function (location) {
          return location.id === country.id;
        });
        if (!exists) {
          flow.dest.location.push(country);
        }
      });
    }

    function _buildSuccessObj(checkedStr) {
      return {
        success: true,
        checked: checkedStr,
      };
    }

    function _castStringToMomentGeneratedString(dateString) {
      const re1 = /\d{4}-\d{2}-\d{2}/;
      const re2 = /\d{2}\/\d{2}\/\d{4}/;

      if (re1.exec(dateString)) {
        dateString = parseDate(dateString).format('YYYY-MM-DD');
      } else if (re2.exec(dateString)) {
        dateString = parseDate(dateString, 'DD/MM/YYYY').format('YYYY-MM-DD');
      } else {
        // Else we're going to try and cast it to a date anyway:
        try {
          dateString = parseDate(dateString).format('YYYY-MM-DD');
        } catch (e) {
          console.error('error', e);
        }
      }

      return dateString;
    }

    // We need a function that abstracts how we fetch a flow object
    // from the server. We're doing an http request or we're querying
    // sequelize.
    function _fetchFlow(id, verId) {
      if ($http) {
        // Fetch flow object through the client's FlowService.
        return _httpRequest(
          `/flow/id/${id}${verId ? `/version/${verId}` : ''}`
        );
      }
      console.error('to implement flow fetch from server');
      // Fetch flow object through sequelize
    }

    function _fetchEmergencies() {
      if ($http) {
        return _httpRequest('/emergency');
      }
      console.error('to implement emergency fetch from server');
    }

    function _fetchEmergency(id) {
      if ($http) {
        return _httpRequest(`/emergency/${id}`);
      }
      console.error('to implement emergency fetch from server');
    }

    function _fetchPlan(id) {
      if ($http) {
        return _httpRequest(`/plan/${id}`, {
          scopes: 'planVersion,categories,emergencies,years,locations',
        });
      }
      console.error('to implement emergency fetch from server');
    }

    function _httpRequest(relUrl, params) {
      return setServiceParams().then(function () {
        if (params && params.scopes) {
          serviceParams.scopes = params.scopes;
        }
        return $http({
          method: 'GET',
          url: serviceUrl + relUrl,
          params: serviceParams,
        }).then(function (response) {
          return response.data.data;
        });
      });
    }
  };
  console.log('angular----->');
  console.log(angular);
  // If angular is undefined, we're on the server.
  if (!angular) {
    exports.HPC = HPC;
  }

  // We have to work around the fact that
  // angular's $q doesn't have an .each
  // where things run serially.
  // function serial(tasks) {
  //   // Fake a “previous task” for our initial iteration
  //   let prevPromise;
  //   const results = [];

  //   const lastTask = function () {
  //     const endPromise = Promise.defer();
  //     endPromise.resolve(results);
  //     return endPromise.promise;
  //   };
  //   tasks = tasks.concat(lastTask);

  //   angular.forEach(tasks, function (task) {
  //     const success = task.success || task;
  //     const notify = task.notify;
  //     let nextPromise;

  //     // First task
  //     if (!prevPromise) {
  //       nextPromise = success();
  //     } else {
  //       // Wait until the previous promise has resolved or rejected to execute the next task
  //       nextPromise = prevPromise.then(
  //         function (result) {
  //           results.push(result);
  //           if (!success) {
  //             return results;
  //           }

  //           return success(result);
  //         },
  //         function (reason) {
  //           results.push(reason);
  //           return Promise.reject(reason);
  //         },
  //         notify
  //       );
  //     }
  //     prevPromise = nextPromise;
  //   });

  //   return prevPromise || Promise.when();
  // }

  function serial(tasks) {
    let prevPromise = Promise.resolve();
    const results = [];

    const lastTask = function () {
      return results;
    };
    tasks.push(lastTask);
    console.log(tasks);
    tasks.forEach(function (task) {
      const success = task.success || task;
      let nextPromise;

      nextPromise = prevPromise.then(
        function (result) {
          results.push(result);
          if (!success) {
            return results;
          }
          return success(result);
        },
        function (reason) {
          results.push(reason);
          return Promise.reject(reason);
        }
      );
      prevPromise = nextPromise;
    });

    return prevPromise;
  }
})(HPC);
