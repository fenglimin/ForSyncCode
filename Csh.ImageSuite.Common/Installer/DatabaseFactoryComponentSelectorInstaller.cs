﻿using Castle.Facilities.TypedFactory;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using Csh.ImageSuite.Common.Interface;

namespace Csh.ImageSuite.Common.Installer
{
    public class DatabaseFactoryComponentSelectorInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Component.For<IDatabaseFactoryComponentSelector>()
                .AsFactory(c => c.SelectedWith(new DatabaseFactoryComponentSelector())));
        }
    }
}
