# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 1024
    vb.cpus = 2
  end

  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "42.42.42.42"

  config.vm.provision :docker do |d|
    d.build_image "/vagrant", args: "-t laszlokorte/kvgenerator"
    d.run "app",
      image: "laszlokorte/kvgenerator",
      args: "-i -t -d -v /vagrant:/vagrant -p 80:3000"
  end
end
