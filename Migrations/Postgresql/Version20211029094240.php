<?php

declare(strict_types=1);

namespace Neos\Flow\Persistence\Doctrine\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211029094240 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE TABLE sandstorm_neosacl_domain_model_dynamicrole (persistence_object_identifier VARCHAR(40) NOT NULL, name VARCHAR(255) NOT NULL, abstract BOOLEAN NOT NULL, parentrolenames jsonb NOT NULL, matcher jsonb NOT NULL, privilege VARCHAR(255) NOT NULL, PRIMARY KEY(persistence_object_identifier))');
        $this->addSql('COMMENT ON COLUMN sandstorm_neosacl_domain_model_dynamicrole.parentrolenames IS \'(DC2Type:flow_json_array)\'');
        $this->addSql('COMMENT ON COLUMN sandstorm_neosacl_domain_model_dynamicrole.matcher IS \'(DC2Type:flow_json_array)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('DROP TABLE sandstorm_neosacl_domain_model_dynamicrole');
    }
}
