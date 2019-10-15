(function(angular, appConfig) {
  'use strict';

  angular
    .module(appConfig.angularModule)
    .service('IconService', IconService);

  IconService.$inject = ['$filter'];

  function IconService($filter) {
    var dir = '/global/js/components/icon/',
        filter = $filter('filter');

    return {
      getIcons: getIcons,
      getIconAddresses: getIconAddresses,
      getIcon: getIcon,
      getIconAddress: getIconAddress,
    };

    function getIconAddress(name, boxStyle) {
      return iconAddress(getSingleIcon(name, boxStyle))[0];
    }

    function getIconAddresses(boxStyle) {
      return iconAddress(getIcons(boxStyle));
    }

    function getIcon(name, boxStyle) {
      return getSingleIcon(name, boxStyle)[0];
    }

    function getIcons(boxStyle) {
      var icons = [
        'blank_icon',
        'clusters_camp_coordination_and_camp_management_icon',
        'clusters_education_icon',
        'clusters_emergency_telecommunications_icon',
        'clusters_food_security_icon',
        'clusters_health_icon',
        'clusters_logistics_icon',
        'clusters_nutrition_icon',
        'clusters_protection_icon',
        'clusters_recovery_icon',
        'clusters_shelter_icon',
        'clusters_water_sanitation_and_hygiene_icon',
        'disaster_cold_wave_icon',
        'disaster_conflict_icon',
        'disaster_cyclone_icon',
        'disaster_drought_icon',
        'disaster_earthquake_icon',
        'disaster_epidemic_icon',
        'disaster_fire_icon',
        'disaster_flash_flood_icon',
        'disaster_flood_icon',
        'disaster_heatwave_icon',
        'disaster_heavy_rain_icon',
        'disaster_humanitarian_access_icon',
        'disaster_insect_infestation_icon',
        'disaster_landslide_icon',
        'disaster_locust_infestation_icon',
        'disaster_population_displacement_icon',
        'disaster_population_return_icon',
        'disaster_snow_avalanche_icon',
        'disaster_snowfall_icon',
        'disaster_storm_icon',
        'disaster_storm_surge_icon',
        'disaster_technological_disaster_icon',
        'disaster_tornado_icon',
        'disaster_tsunami_icon',
        'disaster_violent_wind_icon',
        'disaster_volcano_icon',
        'food_NFI_blanket_icon',
        'food_NFI_bottled_water_icon',
        'food_NFI_bucket_icon',
        'food_NFI_clothing_icon',
        'food_NFI_detergent_icon',
        'food_NFI_flour_icon',
        'food_NFI_food_icon',
        'food_NFI_infant_formula_icon',
        'food_NFI_kitchen_set_icon',
        'food_NFI_mattress_icon',
        'food_NFI_medical_supply_icon',
        'food_NFI_medicine_icon',
        'food_NFI_mosquito_net_icon',
        'food_NFI_nonfood_item_icon',
        'food_NFI_oil_icon',
        'food_NFI_plastic_sheeting_icon',
        'food_NFI_relief_goods_icon',
        'food_NFI_rice_icon',
        'food_NFI_salt_icon',
        'food_NFI_soap_icon',
        'food_NFI_stove_icon',
        'food_NFI_sugar_icon',
        'food_NFI_tarpaulin_icon',
        'food_NFI_tent_icon',
        'food_NFI_vaccine_icon',
        'other_clusters_agriculture_icon',
        'other_clusters_coordination_icon',
        'other_clusters_environment_icon',
        'other_clusters_fishery_icon',
        'other_clusters_multi-sector_icon',
        'other_clusters_rule_of_law_icon',
        'other_clusters_safety_security_icon',
        'product_type_calendar_icon',
        'product_type_chart_icon',
        'product_type_data_icon',
        'product_type_document_icon',
        'product_type_film_icon',
        'product_type_map_icon',
        'product_type_photo_icon',
        'product_type_report_icon',
        'product_type_table_icon',
        'socioeconomic_and_development_debris_management_icon',
        'socioeconomic_and_development_livelihood_icon',
        'socioeconomic_and_development_livestock_icon',
        'socioeconomic_and_development_population_growth_icon',
        'socioeconomic_and_development_reconstruction_icon',
        'socioeconomic_and_development_rural_exodus_icon',
        'socioeconomic_and_development_rural_icon',
        'socioeconomic_and_development_trade_and_market_icon',
        'socioeconomic_and_development_urban_and_rural_icon',
        'socioeconomic_and_development_urban_icon',
        'telecommunications_computer_icon',
        'telecommunications_e-mail_icon',
        'telecommunications_fax_icon',
        'telecommunications_internet_icon',
        'telecommunications_mobile_phone_icon',
        'telecommunications_radio_icon',
        'telecommunications_walkie_talkie_icon',
      ];

      return boxStyle ? iconsBoxStyle(icons) : icons;
    }

    function iconsBoxStyle(icons) {
      angular.forEach(icons, function(icon, i){icons[i] += '_box';});
      return icons;
    }

    function getSingleIcon(name, boxStyle) {
      var icons = getIcons(),
          icon = filter(icons, function(d) { return name === d;});

      icon = icon.length ? icon : [icons[0]];
      return boxStyle ? iconsBoxStyle(icon) : icon;
    }

    function iconAddress(icons) {
      angular.forEach(icons, function(icon, i){icons[i] = dir + icon + '.html';});
      return icons;
    }

  }
})(angular, window.appConfig);