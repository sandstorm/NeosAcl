<?php
namespace Neos\Flow\Persistence\Doctrine\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs! This block will be used as the migration description if getDescription() is not used.
 */
class Version20190208083758 extends AbstractMigration
{

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on "mysql".');

        $this->addSql('CREATE TABLE sandstorm_neosacl_domain_model_dynamicrole (persistence_object_identifier VARCHAR(40) NOT NULL, name VARCHAR(255) NOT NULL, abstract TINYINT(1) NOT NULL, parentrolenames LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', privileges LONGTEXT NOT NULL COMMENT \'(DC2Type:array)\', PRIMARY KEY(persistence_object_identifier)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is autogenerated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on "mysql".');

        $this->addSql('DROP TABLE sandstorm_neosacl_domain_model_dynamicrole');
    }
}
