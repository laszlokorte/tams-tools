# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "42.42.42.42"

  config.vm.provision :docker do |d|
    d.build_image "/vagrant", args: "-t laszlokorte/kvgenerator"
    d.run "app", image: "laszlokorte/kvgenerator", args: "-t -d -p 3000:3000"
  end

  config.vm.provision "shell", inline: "docker start app",
      run: "always"
end
