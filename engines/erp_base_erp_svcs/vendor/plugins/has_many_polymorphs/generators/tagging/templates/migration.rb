
# A migration to add tables for Tag and Tagging. This file is automatically generated and added to your app if you run the tagging generator included with has_many_polymorphs.

class CreateTagsAndTaggings < ActiveRecord::Migration

  # Add the new tables.
  def self.up
    create_table :tags do |t|
      t.column :name, :string, :null => false
    end
    add_index :tags, :name, :unique => true

    create_table :taggings do |t|
      t.column :<%= parent_association_name -%>_id, :integer, :null => false
      t.column :taggable_id, :integer, :null => false
      t.column :taggable_type, :string, :null => false
      # t.column :position, :integer # Uncomment this if you need to use <tt>acts_as_list</tt>.
    end
    add_index :taggings, [:<%= parent_association_name -%>_id, :taggable_id, :taggable_type], :unique => true    
  end

  # Remove the tables.
  def self.down
    drop_table :tags
    drop_table :taggings
  end

end
