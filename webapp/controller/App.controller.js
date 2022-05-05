sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oMessageManager = sap.ui.getCore().getMessageManager(),
					oMessageModel = oMessageManager.getMessageModel(),
					oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
								new Filter("technical", FilterOperator.EQ, true)),
					oViewModel = new JSONModel({
						busy : false,
						hasUIChanges : false,
						usernameEmpty : true,
						order : 0
					});
			
			this.getView().setModel(oViewModel, "appView");
			this.getView().setModel(oMessageModel, "message");
			
			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this._bTechnicalErrors = false;
			
			// var oJSONData = {
			// 	busy : false,
			// 	order:0
			// };
			// var oModel = new JSONModel(oJSONData);
			// this.getView().setModel(oModel, "appView");
		},


		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */


		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId("peopleList").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},
		
		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter("LastName", FilterOperator.Contains, sValue);

			oView.byId("peopleList").getBinding("items").filter(oFilter, FilterType.Application);
		},

		onSort : function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter("LastName", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
			},


		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */


		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @param {Array} [aArgs] - optional array of texts for placeholders.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
		
		_setUIChanges : function(bHasUIChanges){
			if (this._bTechnicalErrors) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.this.getView().getModel().hasPendingChanges();          
			}
		}
	});
});