#########################    configuration de la vm    ######################################

#mettre le reseau de la vm en accès par pont et autoriser les VMs dans le mode de promiscuité

#lancer ces commandes

sudo apt-get update
sudo apt-get upgrade
# si un ecran blanc avec des caractère apparait pour installer grub taper entrer puis choisissez # les deux partitions en faisant espace flèche directionel du bas espace puis taper entrer 
sudo apt-get install build-essential
gcc -v
make -v
sudo apt-get install python-software-properties
sudo apt-get install libssl-dev libreadline-dev
sudo apt-get install git-core curl
sudo apt-get install vim

#installer mongodb
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install mongodb-10gen
#lancer mongodb
sudo /etc/init.d/mongodb start 

#installer nginx
#sudo apt-get install libc6 libpcre3 libpcre3-dev libpcrecpp0 libssl0.9.8 libssl-dev zlib1g zlib1g-dev lsb-base
sudo apt-get install nginx

#télécharger nvm pour node.js
git clone git://github.com/creationix/nvm.git ~/.nvm
. ~/.nvm/nvm.sh
nvm ls
nvm install v0.8.12
nvm alias default v0.8.12
sudo vim ~/.bashrc
#ajouter à la fin de ce fichier ". ~/.nvm/nvm.sh"

#importer notre projet
cd /opt/
sudo mkdir apps
sudo chmod 777 apps
cd apps
git clone git://github.com/shindong09/projet_Web.git

#remplacer default dans /etc/nginx/sites-available par celui du projet
cd /opt/apps/projet_Web/Projet_Web
sudo rm /etc/nginx/sites-available/default
sudo cp default /etc/nginx/sites-available/

#puis lancer nginx
sudo /etc/init.d/nginx start

#et lancer l'application
sudo node /opt/apps/projet_Web/Projet_Web/app.js

#ouvrer une nouvelle fenetre avec Ctrl alt F2
#connecter vous et taper
sudo ifconfig
#l'inet addr de eth0 est l'adresse de la vm, que l'on appelera url
#Vous n'avez plus qu'à aller sur un navigateur et taper http://url:8080 
#Sur la page d'acceuil qui doit être vide, il faut appuyer sur actualité du menu du haut pour lancer les scripts js ( problème d'asynchronicité car les requetes pour sauvegarder les news dans la base de donnée ne sont pas encore faites).

#Si vous voulez mettre une nouvelle version du projet, vous avez a taper les prochaines lignes
cd /opt/apps/projet_Web
git reset --hard HEAD
git clean -f
git pull


	##############   Explication sur les technologies utilisées ###########

	Au tout début de notre projet, nous avions décidé d'utiliser ruby et sinatra pour notre projet mais en voyant le peu de temps que nous avions, nous avons décidé d'utiliser un langage que nous connaissions mais comme même utiliser de nouvelles technologies. 
	C'est pourquoi nous nous sommes tournés vers Node.js qui utilise le JavaScript et qui est assez facile à installer. De plus, avec cette techno, nous aurions une compatibilité directe dans les échanges de données serveur/client (JSon).  De plus, Node.js permet de créer des application en temps réel et ou chacun des deux parties peut créer une connection avec l'autre par lui même (Client/Server). Cette fonctionnalité nous été assez indispensable puisque nous voulions faire un site de news style TheVerge mais en beacoup plus dynamique (les news doivent de mettre à jour sans rafraichissement de la page). En utilisant les frameworks Express.js et Socket.io, nous avons rendu la création de l'application beaucoup plus simple.
	Enfin nous avons décidé d'utiliser une base de donnée de type NoSQL MongoDB pour voir les avantages par rapport à des base de données type MySQL. 
	De ce fait, ce projet a été un excellent moyen d'apprendre de nouvelles technologies intéressantes et en vogue. 

	NB : tous les flux rss utilisés viennent de lepoint.fr

