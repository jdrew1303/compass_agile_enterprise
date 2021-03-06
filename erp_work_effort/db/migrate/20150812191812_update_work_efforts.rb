class UpdateWorkEfforts < ActiveRecord::Migration
  def up

    # WorkEffort
    add_column :work_efforts, :comments, :text unless column_exists? :work_efforts, :comments
    add_column :work_efforts, :percent_done, :integer unless column_exists? :work_efforts, :percent_done
    add_column :work_efforts, :duration, :integer unless column_exists? :work_efforts, :duration
    add_column :work_efforts, :duration_unit, :string unless column_exists? :work_efforts, :duration_unit
    add_column :work_efforts, :effort, :integer unless column_exists? :work_efforts, :effort
    add_column :work_efforts, :effort_unit, :string unless column_exists? :work_efforts, :effort_unit
    add_column :work_efforts, :base_line_start_at, :datetime unless column_exists? :work_efforts, :base_line_start_at
    add_column :work_efforts, :base_line_end_at, :datetime unless column_exists? :work_efforts, :base_line_end_at
    add_column :work_efforts, :base_line_percent_done, :integer unless column_exists? :work_efforts, :base_line_percent_done
    add_column :work_efforts, :project_id, :integer unless column_exists? :work_efforts, :project_id

    add_index :work_efforts, :project_id, name: 'work_effort_project_idx' unless index_exists? :work_efforts, name: 'work_effort_project_idx'

    rename_column :work_efforts, :started_at, :start_at unless column_exists? :work_efforts, :start_at
    rename_column :work_efforts, :finished_at, :end_at unless column_exists? :work_efforts, :end_at

    remove_column :work_efforts, :projected_completion_time if column_exists? :work_efforts, :projected_completion_time
    remove_column :work_efforts, :actual_completion_time if column_exists? :work_efforts, :actual_completion_time

    # WorkEffortAssignment
    add_column :work_effort_associations, :lag, :integer unless column_exists? :work_effort_associations, :lag
    add_column :work_effort_associations, :lag_unit, :string unless column_exists? :work_effort_associations, :lag_unit

    # WorkEffortPartyAssignment
    add_column :work_effort_party_assignments, :resource_allocation, :integer unless column_exists? :work_effort_party_assignments, :resource_allocation
  end

  def down

    # WorkEffort
    remove_column :work_efforts, :comments if column_exists? :work_efforts, :comments
    remove_column :work_efforts, :percent_done if column_exists? :work_efforts, :percent_done
    remove_column :work_efforts, :duration if column_exists? :work_efforts, :duration
    remove_column :work_efforts, :duration_unit if column_exists? :work_efforts, :duration_unit
    remove_column :work_efforts, :effort if column_exists? :work_efforts, :effort
    remove_column :work_efforts, :effort_unit if column_exists? :work_efforts, :effort_unit
    remove_column :work_efforts, :base_line_start_at if column_exists? :work_efforts, :base_line_start_at
    remove_column :work_efforts, :base_line_end_at if column_exists? :work_efforts, :base_line_end_at
    remove_column :work_efforts, :base_line_percent_done if column_exists? :work_efforts, :base_line_percent_done
    remove_column :work_efforts, :project_id if column_exists? :work_efforts, :project_id

    rename_column :work_efforts, :start_at, :started_at unless column_exists? :work_efforts, :started_at
    rename_column :work_efforts, :end_at, :finished_at unless column_exists? :work_efforts, :finished_at

    add_column :work_efforts, :projected_completion_time, :datetime unless column_exists? :work_efforts, :projected_completion_time
    add_column :work_efforts, :actual_completion_time, :datetime unless column_exists? :work_efforts, :actual_completion_time

    # WorkEffortAssignment
    remove_column :work_effort_associations, :lag if column_exists? :work_effort_associations, :lag
    remove_column :work_effort_associations, :lag_unit if column_exists? :work_effort_associations, :lag_unit

    # WorkEffortPartyAssignment
    remove_column :work_effort_party_assignments, :resource_allocation if column_exists? :work_effort_party_assignments, :resource_allocation
  end
end
