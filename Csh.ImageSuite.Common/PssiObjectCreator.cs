﻿using System;
using System.Collections.Generic;
using System.Data;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Common
{
    public class PssiObjectCreator : IPssiObjectCreator
    {
        private readonly ICommonTool _commonTool;

        public PssiObjectCreator(ICommonTool commonTool)
        {
            _commonTool = commonTool;
        }

        public Patient CreatPatient(DataRow row)
        {
            var patient = new Patient()
            {
                Id = _commonTool.GetSafeIntDbValue(row, "ID_Patient"),
                PatientName = _commonTool.GetSafeStringDbValue(row, "PatientName"),
                PatientBirthDate = _commonTool.GetSafeStringDbValue(row, "PatientBirthDate"),
                PatientSex = _commonTool.GetSafeStringDbValue(row, "PatientSex"),
                PatientAge = _commonTool.GetSafeStringDbValue(row, "PatientAge"),
                Breed = _commonTool.GetSafeStringDbValue(row, "Breed"),
                Species = _commonTool.GetSafeStringDbValue(row, "Species"),
                FirstName = _commonTool.GetSafeStringDbValue(row, "FirstName"),
                LastName = _commonTool.GetSafeStringDbValue(row, "LastName"),
                MiddleName = _commonTool.GetSafeStringDbValue(row, "MiddleName"),
                PatientComments = _commonTool.GetSafeStringDbValue(row, "PatientComments"),
                PatientId = _commonTool.GetSafeStringDbValue(row, "PatientID")
            };

            return patient;
        }

        public Study CreateStudy(DataRow row)
        {
            //var study = new Study(_commonTool.GetSafeStringDbValue(row, "StudyInstanceUID"))
            var study = new Study()
            {
                Id = _commonTool.GetSafeIntDbValue(row, "ID_Study"),
                AccessionNo = _commonTool.GetSafeStringDbValue(row, "AccessionNo"),
                StudyId = _commonTool.GetSafeStringDbValue(row, "StudyID"),
                StudyDate = _commonTool.GetSafeStringDbValue(row, "StudyDate"),
                StudyTime = _commonTool.GetSafeStringDbValue(row, "StudyTime"),
                SeriesCount = _commonTool.GetSafeIntDbValue(row, "SeriesCount"),
                ImageCount = _commonTool.GetSafeIntDbValue(row, "IC_Study"),
                StudyDescription = _commonTool.GetSafeStringDbValue(row, "StudyDescription"),
                ReferPhysician = _commonTool.GetSafeStringDbValue(row, "ReferPhysician"),
                TokenId = _commonTool.GetSafeStringDbValue(row, "TokenId"),
                AdditionalPatientHistory = _commonTool.GetSafeStringDbValue(row, "AdditionalPatientHistory"),
                Veterinarian = _commonTool.GetSafeStringDbValue(row, "Veterinarian"),
                RequestedProcPriority = _commonTool.GetSafeStringDbValue(row, "RequestedProcPriority"),
                Printed = _commonTool.GetSafeStringDbValue(row, "Printed"),
                Reserved = _commonTool.GetSafeStringDbValue(row, "Reserved"),
                Readed = _commonTool.GetSafeStringDbValue(row, "Readed"),
                InstanceAvailability = _commonTool.GetSafeStringDbValue(row, "InstanceAvailability"),
                ScanStatus = _commonTool.GetSafeStringDbValue(row, "ScanStatus"),
                Send = _commonTool.GetSafeIntDbValue(row, "Send"),
                SeriesList = new List<Series>(),
                StudyInstanceUid = _commonTool.GetSafeStringDbValue(row, "StudyInstanceUID")
            };

            return study;
        }

        public Series CreateSeries(DataRow row)
        {
            var series = new Series()
            {
                Id = _commonTool.GetSafeIntDbValue(row, "ID_Series"),
                BodyPart = _commonTool.GetSafeStringDbValue(row, "BodyPart"),
                ViewPosition = _commonTool.GetSafeStringDbValue(row, "ViewPosition"),
                Modality = _commonTool.GetSafeStringDbValue(row, "Modality"),
                SeriesNo = _commonTool.GetSafeStringDbValue(row, "SeriesNo"),
                ImageCount = _commonTool.GetSafeIntDbValue(row, "IC_Series"),
                SeriesDate = _commonTool.GetSafeStringDbValue(row, "SeriesDate"),
                SeriesTime = _commonTool.GetSafeStringDbValue(row, "SeriesTime"),
                ContrastBolus = _commonTool.GetSafeStringDbValue(row, "ContrastBolus"),
                LocalBodyPart = _commonTool.GetSafeStringDbValue(row, "LocalBodyPart"),
                SeriesDescription = _commonTool.GetSafeStringDbValue(row, "SeriesDescription"),
                OperatorName = _commonTool.GetSafeStringDbValue(row, "OperatorName"),
                ReferHospital = _commonTool.GetSafeStringDbValue(row, "ReferHospital"),
                PatientPosition = _commonTool.GetSafeStringDbValue(row, "PatientPosition"),
                LocalViewPosition = _commonTool.GetSafeStringDbValue(row, "LocalViewPosition"),
                InstanceUid = _commonTool.GetSafeStringDbValue(row, "SeriesInstanceUID"),
                ImageList = new List<Image>()
        };

            return series;
        }

        public Image CreateImage(DataRow row)
        {
            var image = new Image()
            {
                Id = _commonTool.GetSafeIntDbValue(row, "ID_Image"),
                ImageNo = _commonTool.GetSafeStringDbValue(row, "ImageNo"),
                ImageColumns = _commonTool.GetSafeIntDbValue(row, "ImageColumns"),
                ImageRows = _commonTool.GetSafeIntDbValue(row, "ImageRows"),
                FilePath = _commonTool.GetSafeStringDbValue(row, "ObjectFile"),
                SerializeJson = string.Empty,
                ImageDate = _commonTool.GetSafeStringDbValue(row, "ImageDate"),
                ImageTime = _commonTool.GetSafeStringDbValue(row, "ImageTime"),
                AcquisitionDate = _commonTool.GetSafeStringDbValue(row, "AcquisitionDate"),
                AcquisitionTime = _commonTool.GetSafeStringDbValue(row, "AcquisitionTime"),
                BitsAllocated = _commonTool.GetSafeIntDbValue(row, "BitsAllocated"),
                KeyImage = _commonTool.GetSafeStringDbValue(row, "KeyImage"),
                SopInstanceUid = _commonTool.GetSafeStringDbValue(row, "SOPInstanceUID")

            };

            return image;
        }
    }
}